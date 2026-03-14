const Order = require('../models/Order');

const catchAsync = require('../utils/catchAsync');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = catchAsync(async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Order.countDocuments();

    res.status(200).json({
        success: true,
        count: orders.length,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
        },
        data: orders
    });
});

// @desc    Create order
// @route   POST /api/orders
// @access  Public (for customer orders) or Private/Admin (for manual entry)
exports.createOrder = catchAsync(async (req, res) => {
    // Generate a random order ID if not provided (VS-XXXX)
    if (!req.body.orderId) {
        // Simple random ID, but ideally we should check for uniqueness or use a better strategy
        req.body.orderId = `VS-${Math.floor(Math.random() * 90000 + 10000)}`;
    }

    const order = await Order.create(req.body);


    res.status(201).json({ success: true, data: order });
});

// @desc    Update order status or payment
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrder = catchAsync(async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await order.deleteOne();
    res.status(200).json({ success: true, message: 'Order removed' });
});

// @desc    Track order status
// @route   GET /api/orders/track/:orderId
// @access  Public
exports.trackOrder = catchAsync(async (req, res) => {
    const { orderId } = req.params;
    const { phone } = req.query;

    if (!orderId || !phone) {
        return res.status(400).json({ success: false, message: 'Order ID and Phone Number are required' });
    }

    console.log(`Tracking attempt: OrderID=${orderId}, Phone=${phone}`);

    const order = await Order.findOne({
        orderId: { $regex: new RegExp('^' + orderId + '$', 'i') },
        phone: { $regex: phone.slice(-8) } 
    });

    if (!order) {
        console.log(`Order NOT found for ID: ${orderId} and Phone ending in: ${phone.slice(-8)}`);
        return res.status(404).json({ success: false, message: 'Order not found. Please check your details.' });
    }

    console.log(`Order found: ${order.orderId} for customer ${order.customer}`);


    res.status(200).json({
        success: true,
        data: {
            orderId: order.orderId,
            customer: order.customer,
            status: order.status,
            payment: order.payment,
            items: order.items,
            total: order.total,
            createdAt: order.createdAt,
            location: order.location
        }
    });
});
