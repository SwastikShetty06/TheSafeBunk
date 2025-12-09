const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
const User = require('../models/User');
const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');
const AttendanceLog = require('../models/AttendanceLog');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        console.log('🧹 Cleaning up old demo data...');
        const demoEmail = 'demo@example.com';

        // Find existing user to clean up relations
        const existingUser = await User.findOne({ email: demoEmail });
        if (existingUser) {
            await Subject.deleteMany({ user: existingUser._id });
            await Timetable.deleteMany({ user: existingUser._id });
            await AttendanceLog.deleteMany({ user: existingUser._id });
            await User.deleteOne({ _id: existingUser._id });
        }

        console.log('👤 Creating Demo User...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const semesterStartDate = new Date();
        semesterStartDate.setMonth(semesterStartDate.getMonth() - 4); // 4 months ago

        const user = await User.create({
            name: 'Demo Student',
            email: demoEmail,
            password: hashedPassword,
            minAttendance: 75,
            semesterStartDate: semesterStartDate,
            semesterEndDate: new Date() // Today
        });

        console.log('📚 Creating Subjects...');
        const subjectNames = [
            'Data Structures & Algorithms',
            'Database Management Systems',
            'Operating Systems',
            'Computer Networks',
            'Web Development'
        ];

        const createdSubjects = [];
        for (const name of subjectNames) {
            const sub = await Subject.create({
                user: user._id,
                name,
                totalLectures: 0,
                attendedLectures: 0
            });
            createdSubjects.push(sub);
        }

        console.log('📅 Creating Timetable...');
        // Simple distribution: 
        // Mon: 0, 1, 2
        // Tue: 3, 4, 0
        // Wed: 1, 2, 3
        // Thu: 4, 0, 1
        // Fri: 2, 3, 4
        // Sat/Sun: Empty

        const scheduleMap = {
            Monday: [createdSubjects[0], createdSubjects[1], createdSubjects[2]],
            Tuesday: [createdSubjects[3], createdSubjects[4], createdSubjects[0]],
            Wednesday: [createdSubjects[1], createdSubjects[2], createdSubjects[3]],
            Thursday: [createdSubjects[4], createdSubjects[0], createdSubjects[1]],
            Friday: [createdSubjects[2], createdSubjects[3], createdSubjects[4]],
            Saturday: [],
            Sunday: []
        };

        const timetable = await Timetable.create({
            user: user._id,
            schedule: {
                Monday: scheduleMap.Monday.map(s => s._id),
                Tuesday: scheduleMap.Tuesday.map(s => s._id),
                Wednesday: scheduleMap.Wednesday.map(s => s._id),
                Thursday: scheduleMap.Thursday.map(s => s._id),
                Friday: scheduleMap.Friday.map(s => s._id),
                Saturday: [],
                Sunday: []
            }
        });

        console.log('⏳ Simulating Attendance History (This might take a moment)...');

        // Simulation Logic
        const daysToSimulate = 120; // Approx 4 months
        const today = new Date();
        const logs = [];

        // Track local counts to update subjects at the end
        const subjectStats = {};
        createdSubjects.forEach(s => {
            subjectStats[s._id] = { total: 0, attended: 0 };
        });

        for (let i = daysToSimulate; i >= 1; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);

            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const todaySubjects = scheduleMap[dayName];

            if (!todaySubjects || todaySubjects.length === 0) continue;

            for (const sub of todaySubjects) {
                // Determine Status
                const rand = Math.random();
                let status = 'Present';

                if (rand > 0.90) status = 'Cancelled'; // 10% chance
                else if (rand > 0.75) status = 'Absent'; // 15% chance
                // else 75% Present

                if (status !== 'Cancelled') {
                    subjectStats[sub._id].total += 1;
                    if (status === 'Present') {
                        subjectStats[sub._id].attended += 1;
                    }
                }

                logs.push({
                    user: user._id,
                    subject: sub._id,
                    date: new Date(date), // clone date
                    status
                });
            }
        }

        // Batch insert logs
        await AttendanceLog.insertMany(logs);

        // Update Subjects with counts
        console.log('🔄 Updating Subject Stats...');
        for (const sub of createdSubjects) {
            const stats = subjectStats[sub._id];
            sub.totalLectures = stats.total;
            sub.attendedLectures = stats.attended;
            await sub.save();
        }

        console.log('✅ Data Seeded Successfully!');
        console.log(`- User: ${demoEmail}`);
        console.log(`- Password: password123`);
        console.log(`- Subjects: ${createdSubjects.length}`);
        console.log(`- Attendance Entries: ${logs.length}`);

        process.exit();

    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedData();
