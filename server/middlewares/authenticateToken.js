const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
	const token = req.header("Authorization");
	if (!token) {
		return res
			.status(401)
			.json({ message: "Missing authentication token" });
	}

	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		try {
			const token = req.headers.authorization.split(' ')[1];
			const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
			req.user = decoded.userId;
			next();
		} catch (error) {
			console.error("Error decoding token:", error);
			return res.status(403).json({ message: "Invalid token" });
		}
	}
};

module.exports = authenticateToken;