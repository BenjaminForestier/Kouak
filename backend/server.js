const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const db = require("./models");
const { sequelize } = db;

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

let onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("Un utilisateur est connecté :", socket.id);

    socket.on("userConnected", ({ username }) => {
        onlineUsers.set(username, socket.id);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on("chatMessage", (msg) => {
        console.log("Message reçu :", msg);
        io.emit("chatMessage", { user: msg.user, text: msg.text });
    });

    socket.on("disconnect", () => {
        for (let [user, id] of onlineUsers.entries()) {
            if (id === socket.id) {
                onlineUsers.delete(user);
            }
        }
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
});


sequelize.authenticate()
    .then(() => console.log("Database connected"))
    .catch((err) => console.error(" Database error:", err));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
