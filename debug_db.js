const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./server/models/Order');

async function debug() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hungryheist");
        console.log("Connected to MongoDB...");

        const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
        console.log("Recent Orders Breakdown:");
        orders.forEach(o => {
            console.log(`Order ID: ${o._id}`);
            console.log(`Status: ${o.status}`);
            console.log(`Delivery Address: "${o.deliveryAddress}"`);
            console.log(`Length: ${o.deliveryAddress ? o.deliveryAddress.length : "N/A"}`);
            console.log("-------------------");
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
