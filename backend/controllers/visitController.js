const Visit = require('../models/Visit');

// @desc    Track a visit
// @route   POST /api/visits
// @access  Public
exports.trackVisit = async (req, res) => {
    try {
        const { path } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        await Visit.create({
            ip,
            userAgent,
            path: path || '/'
        });

        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get visit stats
// @route   GET /api/visits/stats
// @access  Private/Admin
exports.getVisitStats = async (req, res) => {
    try {
        const totalVisits = await Visit.countDocuments();
        const uniqueVisitors = await Visit.distinct('ip').then(ips => ips.length);

        // Last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentVisits = await Visit.countDocuments({ timestamp: { $gte: twentyFourHoursAgo } });

        // Visits grouped by day (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const dailyStats = await Visit.aggregate([
            { $match: { timestamp: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalVisits,
                uniqueVisitors,
                recentVisits,
                dailyStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
