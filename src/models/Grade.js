const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    // Not strictly required because sometimes we only have the name string from the JSON
    // But good to link if possible
  },
  nama_mk: { // Store name directly for easier access from raw data
    type: String,
    required: true,
  },
  sks: {
    type: Number,
    required: true,
  },
  nilai: {
    type: String,
    required: true, // e.g., "A", "AB", "B"
  },
  semester: {
    type: String, // e.g., "1", "2", "3 (Fast Track)"
    required: true,
  },
  // Helper fields for calculations
  nilai_angka: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Pre-save hook to calculate numeric grade
gradeSchema.pre('save', function (next) {
  const gradeMap = {
    'A': 4.0, 'AB': 3.5, 'B': 3.0, 'BC': 2.5, 'C': 2.0, 'D': 1.0, 'E': 0.0, 'T': 0.0
  };
  this.nilai_angka = gradeMap[this.nilai] !== undefined ? gradeMap[this.nilai] : 0;
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);
