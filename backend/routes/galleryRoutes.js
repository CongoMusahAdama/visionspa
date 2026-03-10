const express = require('express');
const router = express.Router();
const { getGalleryItems, createGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getGalleryItems)
    .post(protect, createGalleryItem);

router.route('/:id')
    .delete(protect, deleteGalleryItem);

module.exports = router;
