const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const userController = require("../controllers/userController");
const listController = require("../controllers/listController");

router.get("/me", authenticateToken, userController.getLoggedInUserDetails);
router.put("/role", authenticateToken, userController.updateUserRole);
router.get("/lists", authenticateToken, listController.getUserLists);
router.get("/lists/:id", authenticateToken, listController.getListPois);
router.post("/list", authenticateToken, listController.createList);
router.post("/lists/:id", authenticateToken, listController.addPOIToList);
router.delete("/list/:id", authenticateToken, listController.deleteList);
router.delete("/lists/:listId/:poiId", authenticateToken, listController.deletePOIFromList);

module.exports = router;
