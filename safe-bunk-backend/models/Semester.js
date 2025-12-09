const mongoose = require('mongoose');

const SemesterSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, default: 'Semester 1' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isArchived: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Semester', SemesterSchema);
