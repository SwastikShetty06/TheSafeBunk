const cron = require('node-cron');
const Timetable = require('../models/Timetable');
const AttendanceLog = require('../models/AttendanceLog');

const scheduleJobs = () => {
    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('⏰ Running daily attendance check...');

        // This is where you'd implement the logic to find users 
        // who missed filling their attendance for the previous day
        // and mark as 'Not Marked' or send email.

        // Pseudo-code logic:
        // 1. Get Yesterday's day string
        // 2. Find all timetables that had classes yesterday
        // 3. For each class, check if log exists
        // 4. If not, mark 'Not Marked'

        console.log('✅ Daily check complete (Placeholder implementation).');
    });
};

module.exports = scheduleJobs;
