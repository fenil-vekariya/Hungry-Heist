const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const User = require('../server/models/User');
const Restaurant = require('../server/models/Restaurant');

async function debug() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('--- USERS ---');
        const users = await User.find();
        users.forEach(u => {
            console.log(`User: ${u.name}, Role: ${u.role}, isApproved: ${u.isApproved}, ID: ${u._id}`);
        });

        console.log('\n--- RESTAURANTS ---');
        const restaurants = await Restaurant.find().populate('owner');
        restaurants.forEach(r => {
            console.log(`Restaurant: ${r.name}, isApproved: ${r.isApproved}, Owner: ${r.owner?.name}, ID: ${r._id}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
