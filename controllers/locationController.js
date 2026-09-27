const Location = require("../models/Location");
const asyncHandler = require("../utils/asyncHandler");

// @route POST /api/locations
const addLocation = asyncHandler(async (req, res) => {
  const { city, country } = req.body;
  if (!city || !country) {
    return res.status(400).json({ success: false, message: "City and country are required" });
  }

  const location = await Location.create({ user: req.user._id, city, country });
  res.status(201).json({ success: true, message: "Location added", data: location });
});

// @route GET /api/locations
const getLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: locations.length, data: locations });
});

// @route DELETE /api/locations/:id
const deleteLocation = asyncHandler(async (req, res) => {
  const location = await Location.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!location) {
    return res.status(404).json({ success: false, message: "Location not found" });
  }
  res.status(200).json({ success: true, message: "Location deleted" });
});

module.exports = { addLocation, getLocations, deleteLocation };
