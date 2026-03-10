const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
    ip: String,
    userAgent: String,
    path: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Visit', VisitSchema);
