const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrder, deleteOrder, trackOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getOrders)
    .post(createOrder); // Anyone can create an order, but only admin can view them

router.route('/:id')
    .put(protect, updateOrder)
    .delete(protect, deleteOrder);

router.get('/track/:orderId', trackOrder);

module.exports = router;
