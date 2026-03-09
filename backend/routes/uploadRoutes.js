const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/upload
// @desc    Upload image(s) to Cloudinary
// @access  Private (admin only)
router.post('/', protect, upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded.' });
        }

        // Return the Cloudinary secure URLs
        const urls = req.files.map(file => file.path);

        res.status(200).json({
            success: true,
            urls,
            message: `${urls.length} image(s) uploaded successfully.`
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Image upload failed.', error: error.message });
    }
});

// @route   POST /api/upload/screenshot
// @desc    Upload payment screenshot to Cloudinary (Public)
// @access  Public
router.post('/screenshot', upload.single('screenshot'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        res.status(200).json({
            success: true,
            url: req.file.path,
            message: 'Screenshot uploaded successfully.'
        });
    } catch (error) {
        console.error('Screenshot upload error:', error);
        res.status(500).json({ success: false, message: 'Screenshot upload failed.', error: error.message });
    }
});

module.exports = router;
