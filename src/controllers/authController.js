const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth student & get token
// @route   POST /api/auth/login
// @access  Public
const loginStudent = async (req, res) => {
  const { nim, password } = req.body;

  try {
    const student = await Student.findOne({ nim });

    if (student && (await student.matchPassword(password))) {
      // FR01: Return complete student profile
      res.json({
        success: true,
        error: false,
        message: "Login successful",
        data: {
            _id: student._id,
            nim: student.nim,
            nama: student.nama,
            email_sso: student.email_sso,
            jurusan: student.jurusan,
            angkatan: student.angkatan,
            semester: "5", // Calculated or static based on data
            ipk: student.ipk,
            sks_total: student.sks_total,
            tak: student.tak,
            token: generateToken(student._id),
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid NIM or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res) => {
  const { nim, nama, email_sso, password, jurusan, fakultas, angkatan } = req.body;

  try {
    const studentExists = await Student.findOne({ $or: [{ nim }, { email_sso }] });

    if (studentExists) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Student with this NIM or Email already exists'
      });
    }

    const student = await Student.create({
      nim,
      nama,
      email_sso,
      password,
      jurusan: jurusan || 'S1 Informatika',
      fakultas: fakultas || 'Informatika',
      angkatan: angkatan || new Date().getFullYear(),
      sks_total: 0,
      ipk: 0.0,
      tak: 0,
      ikk: 0
    });

    if (student) {
      res.status(201).json({
        success: true,
        error: false,
        message: "Registration successful",
        data: {
          _id: student._id,
          nim: student.nim,
          nama: student.nama,
          email_sso: student.email_sso,
          token: generateToken(student._id),
        },
      });
    } else {
      res.status(400).json({ 
          success: false,
          error: true,
          message: 'Invalid student data' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
        success: false,
        error: true,
        message: error.message 
    });
  }
};

module.exports = { loginStudent, registerStudent };
