const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // format: "Bearer xxx"

    if (!token) {
        return res.status(401).json({ message: "Token manquant" });
    }

    try {
        const decoded = jwt.verify(token, "secret123"); // ⚠️ mets ta clé secrète dans .env plus tard
        req.user = decoded; // on attache l’utilisateur décodé à la requête
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token invalide" });
    }
}

module.exports = authMiddleware;