const Order = require('../models/Order');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Public (for customer orders) or Private/Admin (for manual entry)
exports.createOrder = async (req, res) => {
    try {
        // Generate a random order ID if not provided (VS-XXXX)
        if (!req.body.orderId) {
            req.body.orderId = `VS-${Math.floor(Math.random() * 9000 + 1000)}`;
        }

        const order = await Order.create(req.body);
        res.status(201).json({ success: true, data: order });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update order status or payment
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrder = async (req, res) => {
    try {
        let order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        order = await Order.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        await order.deleteOne();

        res.status(200).json({ success: true, message: 'Order removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
