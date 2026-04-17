const mongoose = require("mongoose");
const User = require("../models/User");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Migration: Reset availability for all approved, idle partners
    await User.updateMany(
      { role: "partner", isApproved: true, currentOrder: null },
      { isAvailable: true }
    );
    console.log("Partner availability synced");
  } catch (error) {
    console.error("CRITICAL: MongoDB Connection Failed!");
    console.error("Error Detail:", error.message);
    if (error.code === 'ESERVFAIL') {
      console.error("DNS Resolution Error: Please check your internet connection or use a local MongoDB URI.");
    }
    console.log("Server will continue running, but database features will be unavailable.");
  }
};

module.exports = connectDB;
