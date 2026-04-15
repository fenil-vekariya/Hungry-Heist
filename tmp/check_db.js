const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const Restaurant = require('../server/models/Restaurant');

async function checkRestaurants() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const restaurants = await Restaurant.find().populate('owner', 'name email');
        console.log('--- RESTAURANT DATA ---');
        restaurants.forEach((r, i) => {
            console.log(`${i + 1}. Name: ${r.name}, isApproved: ${r.isApproved}, Owner: ${r.owner?.name || 'N/A'}`);
        });
        console.log('-----------------------');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkRestaurants();
