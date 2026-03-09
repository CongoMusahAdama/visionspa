const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        type: String,
        required: [true, 'Please provide a customer name']
    },
    phone: {
        type: String,
        required: [true, 'Please provide a contact number']
    },
    location: {
        type: String,
        default: 'N/A'
    },
    items: [
        {
            name: { type: String, required: true },
            category: { type: String, default: 'Luxury' },
            qty: { type: Number, required: true, default: 1 },
            size: { type: String, default: 'M' }
        }
    ],
    total: {
        type: Number,
        required: true,
        default: 0
    },
    payment: {
        type: String,
        enum: ['Paid', 'Unpaid'],
        default: 'Unpaid'
    },
    paymentScreenshot: {
        type: String,
        default: null
    },
    paymentMethod: {
        type: String,
        default: 'Direct Transfer'
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Blocked'],
        default: 'Pending'
    },
    date: {
        type: String,
        default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
