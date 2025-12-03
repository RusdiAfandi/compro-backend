const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  nama_mk: {
    type: String,
    required: true,
    index: true, // For search performance
  },
  nama_mk_en: String,
  sks: {
    type: Number,
    required: true,
  },
  tingkat: {
    type: String, // e.g., "TINGKAT I", "TINGKAT II"
    required: true,
    index: true, // For filter performance
  },
  semester: Number, // Deprecated, specific to one plan
  semester_reguler: Number,
  semester_fast_track: Number,
  status_mk: String, // e.g., "DITAWARKAN"
  is_elective: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
