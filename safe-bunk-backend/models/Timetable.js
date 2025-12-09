const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
    schedule: {
        Monday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
        Tuesday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
        Wednesday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
        Thursday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
        Friday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
        Saturday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
        Sunday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }]
    }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', TimetableSchema);
