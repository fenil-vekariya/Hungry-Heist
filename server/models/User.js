const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "restaurant", "admin", "partner"], default: "customer" },
    phone: { type: String, default: "" },
    address: {
        flat: { type: String, default: "" },
        building: { type: String, default: "" },
        area: { type: String, default: "" },
        town: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        country: { type: String, default: "" },
        pin: { type: String, default: "" }
    },
    vehicleType: { type: String, default: "" },
    vehicleNumber: { type: String, default: "" },
    isAvailable: { type: Boolean, default: false },
    currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    totalEarnings: { type: Number, default: 0 },
    outstandingBalance: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    resetToken: { type: String, default: null },
    resetTokenExpire: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
