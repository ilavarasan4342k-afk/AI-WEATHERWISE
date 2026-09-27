const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent the same user from saving the exact same city+country twice
locationSchema.index({ user: 1, city: 1, country: 1 }, { unique: true });

module.exports = mongoose.model("Location", locationSchema);
