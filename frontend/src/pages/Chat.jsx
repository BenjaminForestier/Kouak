import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Chat() {
    const [socket, setSocket] = useState(null);
    const [username] = useState(localStorage.getItem("username"));
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/users").then((res) => setAllUsers(res.data));

        const newSocket = io("http://localhost:4000", {
            transports: ["websocket"],
            withCredentials: true,
            auth: {
                token: localStorage.getItem("token")
            }
        });
        setSocket(newSocket);

        if (username) {
            newSocket.emit("userConnected", { username });
        }

        newSocket.on("chatHistory", (msgs) => {
            setMessages(msgs);
        });

        newSocket.on("chatMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        newSocket.on("onlineUsers", (users) => {
            setOnlineUsers(users);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [username]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && socket) {
            socket.emit("chatMessage", {
                user: username,
                userId: localStorage.getItem("userId"),
                text: message
            });
            setMessage("");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/login");
    };

    return (
        <div className="chat-layout">

            <div className="chat-sidebar-left">
                <div className="user-info">
                    <span className="avatar">{username?.[0]?.toUpperCase()}</span>
                    <span className="username">{username}</span>
                </div>
                <button onClick={logout} className="logout-btn">🚪 Déconnexion</button>
            </div>

            <div className="chat-main card">
                <h1># Général</h1>
                <div className="chat-box">
                    {messages.map((msg, i) => (
                        <div key={i} className="chat-message">
                            <strong>{msg.user}:</strong> {msg.text}
                        </div>
                    ))}
                </div>
                <form onSubmit={sendMessage} className="chat-form">
                    <input
                        type="text"
                        placeholder="Écrire un message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button type="submit">Envoyer</button>
                </form>
            </div>

            <div className="chat-sidebar-right card">
                <h2>Utilisateurs</h2>
                <ul>
                    {allUsers.map((u) => (
                        <li key={u.id} className="user-item">
                            <span
                                className={`status ${onlineUsers.includes(u.username) ? "online" : "offline"
                                    }`}
                            ></span>
                            {u.username}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}