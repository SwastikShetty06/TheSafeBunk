const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
    name: { type: String, required: true },
    attendedLectures: { type: Number, default: 0 },
    totalLectures: { type: Number, default: 0 },
    // Virtual or Pre-save hook can calculate this, but storing it for quick access is fine
    // We'll calculate it on update.
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

SubjectSchema.virtual('currentPercentage').get(function () {
    if (this.totalLectures === 0) return 0;
    return (this.attendedLectures / this.totalLectures) * 100;
});

module.exports = mongoose.model('Subject', SubjectSchema);
