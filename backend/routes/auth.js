const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { User } = db;

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        console.log("Données reçues :", req.body);
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({ username, email, password: passwordHash });

        res.status(201).json({ message: "Utilisateur créé", user: { id: user.id, username, email } });
    } catch (err) {
        console.error("Erreur à l'inscription :", err);
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: "Email ou mot de passe incorrect" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: "Email ou mot de passe incorrect" });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Connexion réussie", token, username: user.username, user: { id: user.id } });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

module.exports = router;