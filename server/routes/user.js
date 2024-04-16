const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const userController = require("../controllers/userController");
const listController = require("../controllers/listController");

router.get("/me", authenticateToken, userController.getLoggedInUserDetails);
router.put("/role", authenticateToken, userController.updateUserRole);
router.get("/lists", authenticateToken, listController.getUserLists);
router.post("/list", authenticateToken, listController.createList);
router.put("/lists/:id", authenticateToken, listController.updateList);
router.delete("/lists/:id", authenticateToken, listController.deleteList);

module.exports = router;
