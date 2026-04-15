const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./server/models/Order');
const User = require('./server/models/User');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hungryheist");
        console.log("Connected to MongoDB...");

        const orders = await Order.find({ deliveryAddress: { $in: [null, ""] } }).populate('customer');
        console.log(`Found ${orders.length} orders without addresses.`);

        for (const order of orders) {
            if (order.customer && order.customer.address) {
                const addr = order.customer.address;
                const fullAddr = [addr.flat, addr.building, addr.area, addr.town, addr.city]
                    .filter(part => part && part.trim() !== "")
                    .join(", ");
                
                if (fullAddr) {
                    order.deliveryAddress = fullAddr;
                    await order.save();
                    console.log(`Updated Order ${order._id} with address.`);
                }
            }
        }

        console.log("Migration complete!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
