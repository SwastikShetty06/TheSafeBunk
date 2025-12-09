const Subject = require('../models/Subject');
const AttendanceLog = require('../models/AttendanceLog');
const User = require('../models/User');

const calculateSafeBunkStatus = (attended, total, target) => {
    const currentPercentage = total === 0 ? 0 : attended / total;

    // Logic from safeBunkLogic.js
    if (currentPercentage >= target) {
        // Safe
        const safeBunks = Math.floor((attended / target) - total);
        return {
            status: 'SAFE',
            safeBunks,
            message: `You can safely bunk ${safeBunks} classes.`
        };
    } else {
        // Danger
        const needed = Math.ceil((target * total - attended) / (1 - target));
        return {
            status: 'DANGER',
            needed,
            message: `You must attend the next ${needed} classes to recover.`
        };
    }
};

exports.markAttendance = async (req, res) => {
    const { subjectId, status, date } = req.body; // status: 'Present', 'Absent', 'Cancelled'

    try {
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Verify user owns subject
        if (subject.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Check for existing log for today
        const existingLog = await AttendanceLog.findOne({
            user: req.user.id,
            subject: subjectId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingLog) {
            // Updating existing attendance
            const oldStatus = existingLog.status;

            if (oldStatus !== status) {
                // Revert old stats
                if (oldStatus !== 'Cancelled') {
                    subject.totalLectures -= 1;
                    if (oldStatus === 'Present') {
                        subject.attendedLectures -= 1;
                    }
                }

                // Apply new stats
                if (status !== 'Cancelled') {
                    subject.totalLectures += 1;
                    if (status === 'Present') {
                        subject.attendedLectures += 1;
                    }
                }

                existingLog.status = status;
                await existingLog.save();
                await subject.save();
            }
        } else {
            // New attendance entry
            await AttendanceLog.create({
                user: req.user.id,
                subject: subjectId,
                date: date || new Date(),
                status
            });

            // Update Stats
            if (status !== 'Cancelled') {
                subject.totalLectures += 1;
                if (status === 'Present') {
                    subject.attendedLectures += 1;
                }
                await subject.save();
            }
        }

        // Calculate Safe Bunk Logic
        // Get user target
        const user = await User.findById(req.user.id);
        const target = (user.minAttendance || 75) / 100;

        const logicResult = calculateSafeBunkStatus(
            subject.attendedLectures,
            subject.totalLectures,
            target
        );

        res.json({
            subject,
            logic: logicResult
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
