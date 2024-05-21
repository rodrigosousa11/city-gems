const express = require("express");
const router = express.Router();
const poiController = require("../controllers/poiController");
const authenticateToken = require("../middlewares/authenticateToken");
const authenticateRole = require("../middlewares/authenticateRole");

router.post("/new", authenticateToken, authenticateRole, poiController.createPoi);
router.get("/all", authenticateToken, poiController.getPoIs);
router.get("/get/:id", authenticateToken, poiController.getPoI);
router.put("/update/:id", authenticateToken, authenticateRole, poiController.updatePoi);
router.delete("/delete/:id", authenticateToken, authenticateRole, poiController.deletePoi);
router.post("/:id/review", authenticateToken, poiController.addReviewToPoi);
router.delete("/:poiId/review/:reviewId", authenticateToken, poiController.deleteReview);

module.exports = router;