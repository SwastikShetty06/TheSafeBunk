const Timetable = require('../models/Timetable');

exports.getTodayClasses = async (req, res) => {
    try {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];

        let queryDate = today;
        if (req.query.day) {
            queryDate = req.query.day;
        }

        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        const activeSemester = user.activeSemester;
        // If undefined, might need migration, but setupController.getSemesters handles it on frontend init.
        // Or we can lazy migrate here too?
        // Let's assume frontend calls getSemesters first OR we do a quick check.
        // For robustness, if !activeSemester, we could fail or return empty, but let's query carefully.

        let timetableQuery = { user: req.user.id };
        if (activeSemester) {
            timetableQuery.semester = activeSemester;
        }

        const timetable = await Timetable.findOne(timetableQuery)
            .populate(`schedule.${queryDate}`);

        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found. Please complete setup.' });
        }

        const classes = timetable.schedule[queryDate] || [];

        // Fetch attendance logs for today for these subjects
        // We need to define start and end of "today" to query the Date field effectively, or just match date part if stored as midnight
        // Best approach: Match user, date range for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const AttendanceLog = require('../models/AttendanceLog');
        const todayLogs = await AttendanceLog.find({
            user: req.user.id,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        // Create a map of subjectId -> status
        const statusMap = {};
        todayLogs.forEach(log => {
            statusMap[log.subject.toString()] = log.status;
        });

        // Attach status to classes
        const classesWithStatus = classes.map(sub => {
            const subjectObj = sub.toObject();
            subjectObj.todayStatus = statusMap[sub._id.toString()] || null;
            return subjectObj;
        });

        res.json({
            day: queryDate,
            classes: classesWithStatus
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSemesterStats = async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        const activeSemester = user.activeSemester;

        const Subject = require('../models/Subject');
        const query = { user: req.user.id };
        if (activeSemester) {
            query.semester = activeSemester;
        }

        const subjects = await Subject.find(query);

        // Ensure virtuals are included if toJSON is set in schema (it is)
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

