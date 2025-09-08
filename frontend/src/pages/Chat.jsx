import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Chat() {
    const [socket, setSocket] = useState(null);
    const [username, setUsername] = useState(localStorage.getItem("username") || "Anonyme");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const newSocket = io("http://localhost:4000", {
            transports: ["websocket"],
            withCredentials: true,
        });
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("✅ Connecté :", newSocket.id);
        });

        newSocket.on("chatMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && socket) {
            socket.emit("chatMessage", { user: username, text: message });
            setMessage("");
        }
    };

    return (
        <div className="card">
            <h1>💬 Chat</h1>

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
    );
}