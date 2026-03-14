const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./models/Order');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const orderId = 'VS-56476';
    const phone = '0509154727';
    const searchPhone = phone.slice(-8);
    
    console.log('Searching for:', { orderId, searchPhone });
    
    const order = await Order.findOne({
        $or: [
            { orderId: orderId.toUpperCase() },
            { orderId: orderId }
        ],
        phone: { $regex: searchPhone }
    });
    
    console.log('Result:', order ? 'Found' : 'Not Found');
    if (order) {
        console.log('Order found:', {
            orderId: order.orderId,
            phone: order.phone,
            status: order.status
        });
    } else {
        // Try without regex
        const allOrders = await Order.find({ orderId: orderId });
        console.log('All orders with this ID:', allOrders.map(o => ({id: o.orderId, p: o.phone})));
    }
    process.exit();
}

test();
