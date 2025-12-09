const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/safebunk');
        console.log('✅ Connected to MongoDB');

        const email = 'test@example.com';
        const password = 'password123';

        // Check if exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('⚠️ Test user already exists.');
            console.log(`📧 Email: ${email}`);
            console.log(`🔑 Password: ${password} (if not changed)`);
            process.exit(0);
        }

        // Create
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name: 'Test Student',
            email,
            password: hashedPassword,
            minAttendance: 75
        });

        console.log('🎉 Test user created successfully!');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createTestUser();
