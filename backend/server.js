const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("./models");
const { sequelize } = db;
const { Message, User } = require("./models");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

let onlineUsers = new Map();

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Auth error"));

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error("Auth error"));
        socket.user = decoded;
        next();
    });
});

io.on("connection", async (socket) => {
    console.log("Un utilisateur est connecté :", socket.id);

    try {
        const messages = await Message.findAll({
            include: [{ model: User, as: "user", attributes: ["id", "username"] }],
            order: [["timestamp", "ASC"]],
        });

        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            user: msg.user.username,
            text: msg.content,
            timestamp: msg.timestamp
        }));

        socket.emit("chatHistory", formattedMessages);
    } catch (err) {
        console.error("❌ Erreur récupération messages :", err);
    }

    socket.on("userConnected", ({ username }) => {
        onlineUsers.set(username, socket.id);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on("chatMessage", async (msg) => {
        try {
            const newMessage = await Message.create({
                content: msg.text,
                timestamp: new Date(),
                userId: msg.userId
            });

            io.emit("chatMessage", {
                id: newMessage.id,
                user: msg.user,
                text: msg.text,
                timestamp: newMessage.timestamp
            });
        } catch (err) {
            console.error("❌ Erreur enregistrement message :", err);
        }
    });

    socket.on("disconnect", () => {
        for (let [user, id] of onlineUsers.entries()) {
            if (id === socket.id) onlineUsers.delete(user);
        }
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
});

sequelize.authenticate()
    .then(() => console.log("Database connected"))
    .catch((err) => console.error("Database error:", err));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});