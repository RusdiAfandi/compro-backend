const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true // One active simulation per student? "mereset data yang sudah diinput tadi". Yes.
  },
  target_semester: {
    type: Number,
    required: true
  },
  study_plan: {
    type: String,
    enum: ['Reguler', 'Fast Track'],
    required: true
  },
  simulated_courses: [{
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    nama_mk: String,
    sks: Number,
    nilai: String
  }],
  last_calculated: {
    ips: Number,
    ipk_cumulative: Number,
    sks_taken: Number,
    sks_passed: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Simulation', simulationSchema);
