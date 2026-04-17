const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const User = require('../server/models/User');
const Restaurant = require('../server/models/Restaurant');

async function debug() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('--- ALL RESTAURANT ROLE USERS ---');
        const restaurantUsers = await User.find({ role: { $regex: /^restaurant$/i } });
        restaurantUsers.forEach(u => {
            console.log(`User: ${u.name}, isApproved: ${u.isApproved}, ID: ${u._id}`);
        });

        console.log('\n--- ALL RESTAURANT PROFILES ---');
        const restaurants = await Restaurant.find().populate('owner');
        restaurants.forEach(r => {
            console.log(`Restaurant: ${r.name}, isApproved: ${r.isApproved}, Owner ID: ${r.owner?._id || r.owner}, Owner Name: ${r.owner?.name || 'N/A'}`);
        });

        console.log('\n--- WHAT getPendingRestaurants WOULD RETURN ---');
        const pendingProfiles = await Restaurant.find({ isApproved: false }).populate("owner", "name email");
        const pendingAccounts = await User.find({ role: { $regex: /^restaurant$/i }, isApproved: false });
        
        const formattedAccounts = pendingAccounts.filter(acc => 
          !pendingProfiles.some(p => p.owner?._id?.toString() === acc._id.toString())
        );

        console.log('Pending Profiles Count:', pendingProfiles.length);
        console.log('Pending Accounts Count (filtered):', formattedAccounts.length);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
