const express = require("express");
const db = require("../models");
const { User } = db;
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "username", "email"],
        });
        res.json(users);
    } catch (err) {
        console.error("❌ Erreur /users :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;