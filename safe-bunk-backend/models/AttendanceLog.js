const mongoose = require('mongoose');

const AttendanceLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    date: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Cancelled', 'Not Marked'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('AttendanceLog', AttendanceLogSchema);
