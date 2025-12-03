const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  nim: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  nama: {
    type: String,
    required: true,
  },
  email_sso: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  jurusan: String,
  fakultas: String,
  angkatan: Number,
  sks_total: Number,
  ipk: Number,
  tak: Number,
  ikk: Number,
  // Ringkasan Akademik
  sks_tingkat: {
    tingkat_1: String,
    tingkat_2: String,
    tingkat_3: String,
    tingkat_4: String,
  },
  ip_tingkat: {
    tingkat_1: String,
    tingkat_2: String,
    tingkat_3: String,
    tingkat_4: String,
  },
  // FR03.1: Integrasi Minat
  interests: {
    hard_skills: [String],
    soft_skills: [String]
  }
}, {
  timestamps: true
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook to hash password only if modified
studentSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('Student', studentSchema);
