const mongoose = require('mongoose');
const User = require('./server/models/User');
const Restaurant = require('./server/models/Restaurant');
require('dotenv').config({ path: './server/.env' });

async function debug() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const pendingProfiles = await Restaurant.find({ isApproved: false }).populate("owner", "name email");
    console.log("Pending Profiles Count:", pendingProfiles.length);

    const pendingAccounts = await User.find({
      role: "restaurant",
      isApproved: false
    }).select("name email role");
    console.log("Pending Accounts Count:", pendingAccounts.length);
    console.log("Pending Accounts Details:", JSON.stringify(pendingAccounts, null, 2));

    const formattedAccounts = pendingAccounts.filter(acc => 
      !pendingProfiles.some(p => p.owner?._id?.toString() === acc._id.toString())
    ).map(acc => ({
      _id: acc._id,
      name: "New Account Registration",
      owner: { name: acc.name, email: acc.email, _id: acc._id },
      isAccountOnly: true
    }));
    console.log("Formatted Accounts Count:", formattedAccounts.length);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debug();
