const express = require("express");
const { getAIInsight } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/insight/:city", protect, getAIInsight);

module.exports = router;
