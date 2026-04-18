const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    image: {
        type: String
    },
    banner: {
        type: String
    },
    category: {
        type: String,
        default: "Both"
    },
    cuisine: {
        type: String,
        default: ""
    },
    openingTime: {
        type: String,
        default: "09:00"
    },
    closingTime: {
        type: String,
        default: "22:00"
    },
    averagePrice: {
        type: Number,
        default: 0
    },
    deliveryTime: {
        type: String,
        default: ""
    },
    deliveryCharge: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
