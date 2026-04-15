const mongoose = require('mongoose');

async function checkOrders() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hungry_heist'); // Change if different
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    const Restaurant = mongoose.model('Restaurant', new mongoose.Schema({}, { strict: false }));
    
    // Find all restaurants first
    const restaurants = await Restaurant.find({});
    console.log('Total Restaurants:', restaurants.length);
    
    for (const r of restaurants) {
      const orders = await Order.find({ restaurant: r._id });
      console.log(`Restaurant: ${r.name} (${r._id}) - Orders: ${orders.length}`);
      if (orders.length > 0) {
        const statuses = [...new Set(orders.map(o => o.status))];
        console.log(`  Statuses: ${statuses.join(', ')}`);
        const completed = orders.filter(o => o.status === 'Completed' || o.status === 'completed');
        console.log(`  Completed/completed: ${completed.length}`);
        const total = completed.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
        console.log(`  Calculated Revenue: ${total}`);
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkOrders();
