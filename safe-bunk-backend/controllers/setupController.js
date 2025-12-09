const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');
const Semester = require('../models/Semester');
const User = require('../models/User');

// Helper to ensure active semester exists (Migration Logic)
const ensureActiveSemester = async (userId) => {
    const user = await User.findById(userId);
    if (user.activeSemester) return user.activeSemester;

    // Create default semester if none exists
    const sem = await Semester.create({
        user: userId,
        name: 'Semester 1',
        startDate: user.semesterStartDate || new Date()
    });

    // Migrate orphans
    await Subject.updateMany(
        { user: userId, semester: { $exists: false } },
        { semester: sem._id }
    );
    await Timetable.updateMany(
        { user: userId, semester: { $exists: false } },
        { semester: sem._id }
    );

    // Update user
    user.activeSemester = sem._id;
    await user.save();
    return sem._id;
};

exports.getSemesters = async (req, res) => {
    try {
        // Ensure migration runs when listing
        await ensureActiveSemester(req.user.id);

        const semesters = await Semester.find({ user: req.user.id }).sort({ createdAt: -1 });
        const user = await User.findById(req.user.id);

        res.json({
            semesters,
            activeSemester: user.activeSemester
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createSemester = async (req, res) => {
    try {
        const { name } = req.body;

        // Create new semester
        const sem = await Semester.create({
            user: req.user.id,
            name: name || `Semester ${await Semester.countDocuments({ user: req.user.id }) + 1}`,
            startDate: new Date()
        });

        // Set as active
        await User.findByIdAndUpdate(req.user.id, { activeSemester: sem._id });

        res.json({ message: 'New semester started', semester: sem });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.switchSemester = async (req, res) => {
    try {
        const { semesterId } = req.body;

        // Update user active semester
        await User.findByIdAndUpdate(req.user.id, { activeSemester: semesterId });

        res.json({ message: 'Switched semester' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSemesterName = async (req, res) => {
    try {
        const { semesterId, name } = req.body;
        await Semester.findByIdAndUpdate(semesterId, { name });
        res.json({ message: 'Semester renamed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createSubject = async (req, res) => {
    const { name, totalLectures, attendedLectures } = req.body;
    try {
        const semesterId = await ensureActiveSemester(req.user.id);

        const subject = new Subject({
            user: req.user.id,
            semester: semesterId,
            name,
            totalLectures,
            attendedLectures
        });
        await subject.save();
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createTimetable = async (req, res) => {
    const { schedule } = req.body;
    try {
        const semesterId = await ensureActiveSemester(req.user.id);

        let timetable = await Timetable.findOne({ user: req.user.id, semester: semesterId });

        if (timetable) {
            // Update existing
            timetable.schedule = schedule;
            await timetable.save();
        } else {
            // Create new
            timetable = new Timetable({
                user: req.user.id,
                semester: semesterId,
                schedule
            });
            await timetable.save();
        }
        res.status(201).json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resetSemester = async (req, res) => {
    try {
        const userId = req.user.id;
        // Delete all related data
        await Subject.deleteMany({ user: userId });
        await Timetable.deleteMany({ user: userId });
        // Assuming AttendanceLog is imported or we need to import it
        // We need to import AttendanceLog at the top
        const AttendanceLog = require('../models/AttendanceLog');
        await AttendanceLog.deleteMany({ user: userId });

        // Update User semester start date
        const User = require('../models/User');
        await User.findByIdAndUpdate(userId, {
            semesterStartDate: new Date(),
            semesterEndDate: null
        });

        res.json({ message: 'Semester reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getTimetable = async (req, res) => {
    try {
        const semesterId = await ensureActiveSemester(req.user.id);
        const timetable = await Timetable.findOne({ user: req.user.id, semester: semesterId })
            .populate('schedule.Monday schedule.Tuesday schedule.Wednesday schedule.Thursday schedule.Friday schedule.Saturday schedule.Sunday');

        res.json(timetable ? timetable.schedule : {});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
