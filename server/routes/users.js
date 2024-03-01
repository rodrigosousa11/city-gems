const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const userController = require("../controllers/userController");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/me", authenticateToken, userController.getLoggedInUserDetails);
router.post("/token", userController.refreshToken);
router.delete("/logout", userController.logoutUser);

module.exports = router;