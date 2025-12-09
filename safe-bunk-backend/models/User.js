const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    minAttendance: { type: Number, default: 75 },
    semesterStartDate: { type: Date },
    semesterEndDate: { type: Date },
    activeSemester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
