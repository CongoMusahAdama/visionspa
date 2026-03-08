const express = require('express');
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('./authRoutes'); // Assuming you have an auth middleware here if needed

const router = express.Router();

router.route('/')
    .get(getCategories)
    .post(createCategory); // Add auth middleware if needed

router.route('/:id')
    .delete(deleteCategory); // Add auth middleware if needed

module.exports = router;
