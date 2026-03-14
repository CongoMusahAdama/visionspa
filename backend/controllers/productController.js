const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = catchAsync(async (req, res) => {
    // Optimized cleanup: Delete sold out products older than 3 days directly in DB
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    await Product.deleteMany({
        soldOutAt: { $ne: null, $lt: threeDaysAgo }
    });

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const products = await Product.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Product.countDocuments();

    res.status(200).json({
        success: true,
        count: products.length,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
        },
        data: products
    });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = catchAsync(async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = catchAsync(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Product removed' });
});

