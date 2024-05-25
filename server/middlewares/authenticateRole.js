const User = require("../models/User");

const isAdmin = (req, res, next) => {
    const userId = req.user;

    User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }

            if (user.role === "admin") {
                next();
            } else {
                return res.status(403).json({ message: "Access forbidden. You must be an admin." });
            }
        })
        .catch(error => {
            console.error("Error checking user admin status:", error);
            return res.status(500).json({ message: "Internal server error." });
        });
};

module.exports = isAdmin;