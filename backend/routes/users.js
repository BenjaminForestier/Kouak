const express = require("express");
const db = require("../models");
const { User } = db;

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "username", "email"],
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

module.exports = router;