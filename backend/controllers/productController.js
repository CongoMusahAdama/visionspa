const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        let products = await Product.find().sort({ createdAt: -1 });

        const now = new Date();
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        const toDeleteIds = [];

        products = products.filter(p => {
            const isSoldOut = p.status === 'Sold Out' || p.stock === 0 || !!p.soldOutAt;
            if (isSoldOut && p.soldOutAt) {
                const soldDate = new Date(p.soldOutAt);
                if (now - soldDate > threeDaysMs) {
                    toDeleteIds.push(p._id);
                    return false;
                }
            }
            return true;
        });

        if (toDeleteIds.length > 0) {
            await Product.deleteMany({ _id: { $in: toDeleteIds } });
        }

        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        await product.deleteOne();

        res.status(200).json({ success: true, message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
