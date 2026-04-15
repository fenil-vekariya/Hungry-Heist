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
    console.log("DB Connection Failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;
