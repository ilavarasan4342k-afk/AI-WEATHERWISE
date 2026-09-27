const express = require("express");
const { addLocation, getLocations, deleteLocation } = require("../controllers/locationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect); // every route below requires a valid JWT

router.post("/", addLocation);
router.get("/", getLocations);
router.delete("/:id", deleteLocation);

module.exports = router;
