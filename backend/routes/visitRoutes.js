const express = require('express');
const router = express.Router();
const { trackVisit, getVisitStats } = require('../controllers/visitController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', (req, res) => res.json({ message: 'Visit API is alive' }));
router.post('/', trackVisit);

router.get('/stats', protect, getVisitStats);

module.exports = router;
