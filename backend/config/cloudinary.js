const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'visionspa_products',      // Folder in your Cloudinary account
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
        transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = { cloudinary, upload };
