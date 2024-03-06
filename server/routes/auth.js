const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const authController = require("../controllers/authController");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/me", authenticateToken, authController.getLoggedInUserDetails);
router.post("/token", authController.refreshToken);
router.delete("/logout", authController.logoutUser);

module.exports = router;