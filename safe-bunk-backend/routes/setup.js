const express = require('express');
const router = express.Router();
const {
    createSubject,
    createTimetable,
    resetSemester,
    createSemester,
    switchSemester,
    getSemesters,
    updateSemesterName
} = require('../controllers/setupController');
const { protect } = require('../middleware/authMiddleware');

router.post('/subject', protect, createSubject);
router.post('/timetable', protect, createTimetable);
router.get('/timetable', protect, require('../controllers/setupController').getTimetable);
router.post('/reset', protect, resetSemester); // Keeping for legacy/danger

// Semester Management
router.get('/semesters', protect, getSemesters);
router.post('/semester/new', protect, createSemester);
router.post('/semester/switch', protect, switchSemester);
router.post('/semester/rename', protect, updateSemesterName);

module.exports = router;
