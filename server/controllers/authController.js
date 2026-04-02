const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log("Registered Role:", role);

    const validRoles = ["customer", "restaurant"];
    const finalRole = role || "customer";
    if (!validRoles.includes(finalRole)) {
      return res.status(400).json({ message: "Invalid role selected. Admin registration is disabled." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      isApproved: finalRole === "restaurant" ? false : true
    });

    await newUser.save();

    res.status(201).json({
      message: "Registration successful"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked. Please contact support." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.role === "restaurant" && !user.isApproved) {
      return res.status(403).json({ message: "Waiting for admin approval" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error fetching profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id || req.user._id);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone !== undefined ? phone : user.phone;

    await user.save();
    
    const updatedUser = await User.findById(req.user.id || req.user._id).select("-password -__v");
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server Error updating profile" });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const addressFields = req.body;
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.address = { ...user.address.toObject?.() || user.address, ...addressFields };
    await user.save();

    res.json({ message: "Address updated successfully", address: user.address });
  } catch (error) {
    res.status(500).json({ message: "Server Error updating address" });
  }
};
