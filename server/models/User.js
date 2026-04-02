const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "restaurant", "admin"], default: "customer" },
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
    isBlocked: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
// Trigger nodemon restart
