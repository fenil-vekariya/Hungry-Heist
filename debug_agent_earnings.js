const mongoose = require('mongoose');
const User = require('./server/models/User');
const Order = require('./server/models/Order');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/hungryheist'); // Adjust DB name if needed
  
  const agents = await User.find({ role: 'partner' });
  for (const agent of agents) {
    const completedOrders = await Order.find({
      deliveryAgent: agent._id,
      status: { $regex: /^Completed$/i }
    });
    const total = completedOrders.reduce((sum, order) => sum + (order.agentEarning || 0), 0);
    console.log(`Agent: ${agent.name}, Stored: ${agent.totalEarnings}, Dynamic: ${total}, Order Count: ${completedOrders.length}`);
  }
  
  process.exit();
}

check();
