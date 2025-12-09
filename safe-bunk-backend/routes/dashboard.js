const express = require('express');
const router = express.Router();
const { getTodayClasses, getSemesterStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/today', protect, getTodayClasses);
router.get('/stats', protect, getSemesterStats);

module.exports = router;
