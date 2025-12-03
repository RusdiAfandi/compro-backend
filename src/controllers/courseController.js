const Course = require('../models/Course');

// @desc    Get all courses with optional search and filter
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const { keyword, tingkat } = req.query;
    const query = {};

    if (keyword) {
      query.nama_mk = { $regex: keyword, $options: 'i' };
    }

    if (tingkat) {
        // Flexible matching for tingkat (e.g. "1" maps to "TINGKAT I")
        // Map input "1", "2", "3", "4" to DB format "TINGKAT I", etc.
        const tingkatMap = {
            '1': 'TINGKAT I',
            '2': 'TINGKAT II',
            '3': 'TINGKAT III',
            '4': 'TINGKAT IV'
        };
        
        if (tingkatMap[tingkat]) {
            query.tingkat = tingkatMap[tingkat];
        } else {
            // If user sends "TINGKAT I" directly
             query.tingkat = tingkat;
        }
    }

    const courses = await Course.find(query).select('nama_mk sks tingkat status_mk semester');
    
    if (courses.length === 0) {
        return res.status(200).json({
            success: true,
            error: false,
            data: [],
            message: "Tidak ditemukan mata kuliah pada tingkat ini."
        });
    }

    res.status(200).json({
        success: true,
        error: false,
        data: courses,
        message: "Data mata kuliah berhasil diambil."
    });
  } catch (error) {
    res.status(500).json({ 
        success: false,
        error: true,
        message: error.message 
    });
  }
};

module.exports = { getCourses };
