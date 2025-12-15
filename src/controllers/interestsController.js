const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');
const Grade = require('../models/Grade');

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper to get Skills Data
const getSkillsData = () => {
    try {
        const skillsPath = path.join(__dirname, '../../data_json/Skills.json');
        const skillsRaw = JSON.parse(fs.readFileSync(skillsPath, 'utf-8'));
        
        // Extract and unique
        const hardSkills = [...new Set(skillsRaw.map(s => s["Hard Skills"]).filter(Boolean))];
        const softSkills = [...new Set(skillsRaw.map(s => s["Soft Skills"]).filter(Boolean))];
        
        return { hard_skills: hardSkills, soft_skills: softSkills };
    } catch (e) {
        console.error("Error reading skills:", e);
        return { hard_skills: [], soft_skills: [] };
    }
};

// Helper to get All Course Names
const getAllCoursesData = () => {
    try {
        const coursesPath = path.join(__dirname, '../../data_json/Nama_MK_All.json');
        const coursesRaw = JSON.parse(fs.readFileSync(coursesPath, 'utf-8'));
        
        // Extract course names
        const courses = coursesRaw.map(c => c["NAMA MK"]).filter(Boolean);
        
        return courses;
    } catch (e) {
        console.error("Error reading courses:", e);
        return [];
    }
};

// @desc    Get User Interests and Available Options
// @route   GET /api/interests
// @access  Private
const getInterests = async (req, res) => {
    try {
        const student = await Student.findById(req.student._id);
        const options = getSkillsData();

        res.status(200).json({
            success: true,
            message: "Data minat berhasil diambil.",
            data: {
                user_interests: student.interests || { hard_skills: [], soft_skills: [] },
                available_options: options
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: true, message: error.message });
    }
};

// @desc    Update User Interests (FR03.1)
// @route   POST /api/interests
// @access  Private
const updateInterests = async (req, res) => {
    try {
        const { hard_skills, soft_skills } = req.body;

        // Validate Input
        if (!Array.isArray(hard_skills) || !Array.isArray(soft_skills)) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Format minat tidak valid. Harap kirim array string."
            });
        }

        const student = await Student.findById(req.student._id);
        student.interests = { hard_skills, soft_skills };
        await student.save();

        res.status(200).json({
            success: true,
            message: "Minat berhasil disimpan.",
            data: student.interests
        });
    } catch (error) {
        res.status(500).json({ success: false, error: true, message: error.message });
    }
};

// @desc    Get AI Recommendation (FR03.2)
// @route   POST /api/interests/recommend
// @access  Private
const getRecommendations = async (req, res) => {
    try {
        const student = await Student.findById(req.student._id);
        const grades = await Grade.find({ student: student._id });

        // Calculate current semester dynamically
        // Assuming 2 semesters per year.
        // Current Year - Angkatan * 2 + (Month > 6 ? 1 : 0)
        // Or simpler: Max semester in grades + 1
        let currentSemester = 1;
        if (grades.length > 0) {
            // Extract max semester from grades (some might be strings "3 (Fast Track)")
            const semesters = grades.map(g => parseInt(g.semester) || 0);
            const maxSem = Math.max(...semesters);
            currentSemester = maxSem + 1;
        }

        // Prepare data for AI Model
        const courses = getAllCoursesData();
        const aiInput = {
            profile: {
                jurusan: student.jurusan,
                semester: currentSemester, 
                ipk: student.ipk
            },
            academic_history: grades.map(g => ({ name: g.nama_mk, score: g.nilai })),
            interests: student.interests,
            available_courses: courses
        };

        // Check if API Key is set
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
             // Fallback or Error if key missing
             return res.status(503).json({
                 success: false,
                 error: true,
                 message: "Layanan AI tidak tersedia (API Key missing).",
                 data_debug: aiInput
             });
        }

        const prompt = `
        Anda adalah konsultan akademik universitas. Berdasarkan data mahasiswa berikut, berikan rekomendasi mata kuliah dari daftar mata kuliah yang tersedia.

        DATA MAHASISWA:
        ${JSON.stringify(aiInput)}

        INTRUKSI OUTPUT:
        1. Analisis minat (hard/soft skills) dan riwayat nilai mahasiswa.
        2. Pilih 3-5 mata kuliah dari "available_courses" yang paling relevan.
        3. Pastikan rekomendasi HANYA dari daftar mata kuliah yang tersedia (available_courses).
        4. JANGAN buat nama mata kuliah baru yang tidak ada di daftar.
        5. Jelaskan alasan singkat mengapa mata kuliah tersebut cocok berdasarkan minat dan riwayat akademik.
        6. OUTPUT HARUS BERUPA JSON VALID SAJA. Gunakan format berikut:
        {
            "recommendations": [
                {
                    "name": "Nama Mata Kuliah (harus dari available_courses)",
                    "type": "Hard Skill/Soft Skill/Course",
                    "reason": "Alasan rekomendasi berdasarkan minat dan riwayat..."
                }
            ]
        }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const text = response.text; 
        let recommendationsData;
        
        try {
            // If responseMimeType is json, it should be clean json, but simple parse ensures safety
            recommendationsData = JSON.parse(text);
        } catch (e) {
            console.error("AI JSON Parse Error:", text);
            return res.status(500).json({
                success: false,
                error: true,
                message: "Gagal memproses respon AI (Invalid JSON).",
            });
        }

        res.status(200).json({
            success: true,
            message: "Rekomendasi AI berhasil dibuat.",
            data: {
                ...recommendationsData
            }
        });

    } catch (error) {
        console.error("Gemini Error:", error);
        
        const errorStr = JSON.stringify(error);
        const isQuotaError = 
            error.status === 429 || 
            (error.message && error.message.includes('429')) || 
            (error.message && error.message.includes('Quota exceeded')) ||
            errorStr.includes('429') || 
            errorStr.includes('Quota exceeded');

        // Fallback logic for demo purposes if API quota exceeded
        if (isQuotaError) {
             const recommendations = [
                { name: 'Deep Learning', type: 'Course', reason: 'Rekomendasi Fallback (AI Quota Exceeded): Relevan dengan minat AI/Data.' },
                { name: 'Network Security', type: 'Course', reason: 'Rekomendasi Fallback: Relevan dengan minat Security.' },
                { name: 'Cloud Computing', type: 'Course', reason: 'Rekomendasi Fallback: Skill fundamental infrastruktur.' }
            ];
            
            return res.status(200).json({
                success: true,
                error: false,
                message: "Rekomendasi Fallback (AI Quota Habis).",
                data: {
                    recommendations: recommendations
                }
            });
        }

        res.status(500).json({ success: false, error: true, message: "Terjadi kesalahan pada layanan AI: " + error.message });
    }
};

module.exports = { getInterests, updateInterests, getRecommendations };
