const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/token", authController.refreshToken);
router.delete("/logout", authController.logoutUser);
router.post("/forgot-password", authController.requestPasswordReset);
router.post("/reset-password/", authController.verifyCodeAndResetPassword);

module.exports = router;