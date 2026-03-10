const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Please provide an image URL']
    },
    type: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', GallerySchema);
