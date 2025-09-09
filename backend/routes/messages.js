const express = require("express");
const { Message, User } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const messages = await Message.findAll({
            include: [{ model: User, as: "user", attributes: ["id", "username"] }],
            order: [["timestamp", "ASC"]],
        });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: "Message vide" });

        const newMessage = await Message.create({
            content,
            userId: req.user.id,
        });

        const savedMessage = await Message.findByPk(newMessage.id, {
            include: [{ model: User, as: "user", attributes: ["id", "username"] }],
        });

        res.status(201).json(savedMessage);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

module.exports = router;