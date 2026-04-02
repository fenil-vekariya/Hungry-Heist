const mongoose = require('mongoose');
const User = require('./models/user');

async function run() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hungryheist');
    const user = await User.findOne({role: 'restaurant'});
    console.log(JSON.stringify(user, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
