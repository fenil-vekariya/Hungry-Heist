const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, vehicleType, vehicleNumber, phone } = req.body;

    const validRoles = ["customer", "restaurant", "partner"];
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
      phone: phone || "",
      vehicleType: finalRole === "partner" ? vehicleType : "",
      vehicleNumber: finalRole === "partner" ? vehicleNumber : "",
      isApproved: (finalRole === "restaurant" || finalRole === "partner") ? false : true
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

    if ((user.role === "restaurant" || user.role === "partner") && !user.isApproved) {
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
    
    // Support for partner details
    if (user.role === "partner") {
      if (req.body.vehicleType) user.vehicleType = req.body.vehicleType;
      if (req.body.vehicleNumber) user.vehicleNumber = req.body.vehicleNumber;
    }

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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    const crypto = require("crypto");
    const token = crypto.randomBytes(20).toString("hex");

    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 900000; // 15 minutes
    await user.save();

    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    const mailOptions = {
      from: `"Hungry Heist" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Link",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h2 style="color: #f97316; text-align: center;">Hungry Heist</h2>
          <p>You requested a password reset. Please click the button below to reset your password. This link is valid for 15 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 Hungry Heist. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Reset link sent to your email" });
  } catch (error) {
    console.error("NODEMAILER ERROR:", error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpire = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error resetting password" });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const jwt = require("jsonwebtoken");
    const decoded = jwt.decode(credential);

    if (!decoded || !decoded.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      user = new User({
        name: decoded.name,
        email: decoded.email,
        password: await bcrypt.hash(Math.random().toString(36), 10),
        role: "customer",
        isApproved: true
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      message: "Google login successful"
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Server Error during Google login" });
  }
};
