const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Course = require('../models/Course');

const gradeMap = {
  'A': 4.0, 'AB': 3.5, 'B': 3.0, 'BC': 2.5, 'C': 2.0, 'D': 1.0, 'E': 0.0, 'T': 0.0
};

const calculateStats = (grades) => {
    let totalSKS = 0;
    let totalPoints = 0;
    let sksLulus = 0;

    grades.forEach(g => {
        const nilaiAngka = gradeMap[g.nilai] !== undefined ? gradeMap[g.nilai] : 0;
        const sks = parseInt(g.sks);
        
        totalSKS += sks;
        totalPoints += (sks * nilaiAngka);
        
        if (['A', 'AB', 'B', 'BC', 'C', 'D'].includes(g.nilai)) {
            sksLulus += sks;
        }
    });

    const ip = totalSKS > 0 ? (totalPoints / totalSKS).toFixed(2) : 0;

    return {
        totalSKS,
        sksLulus,
        ip
    };
};

// @desc    Calculate simulation results
// @route   POST /api/simulation/calculate
// @access  Private
const Simulation = require('../models/Simulation');

const calculateSimulation = async (req, res) => {
    try {
        const { simulated_courses, target_semester, study_plan } = req.body;

        // Scenario 5: Malformed/Incomplete Data (422)
        if (!simulated_courses || !Array.isArray(simulated_courses)) {
            return res.status(422).json({
                success: false,
                error: true,
                message: "Data tidak lengkap. Periksa kembali pilihan mata kuliah dan nilai."
            });
        }

        // Scenario 1: Empty List (400)
        if (simulated_courses.length === 0) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Tambahkan minimal 1 mata kuliah untuk memulai simulasi."
            });
        }

        // Scenario 4: Missing Grades (400)
        const hasEmptyGrades = simulated_courses.some(course => !course.nilai);
        if (hasEmptyGrades) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "Isi semua nilai sebelum menjalankan simulasi."
            });
        }
        
        const studentId = req.student._id;

        // 1. Get Historical Data
        const existingGrades = await Grade.find({ student: studentId });
        
        const courseHistoryMap = new Map(); 

        existingGrades.forEach(g => {
            if (parseInt(g.semester) !== parseInt(target_semester)) {
                courseHistoryMap.set(g.nama_mk, {
                    nama_mk: g.nama_mk,
                    sks: g.sks,
                    nilai: g.nilai,
                    semester: g.semester
                });
            }
        });

        // 2. Process Simulation Courses
        const semesterSimulationStats = calculateStats(simulated_courses);

        // 3. Merge for Cumulative IPK
        simulated_courses.forEach(sc => {
            courseHistoryMap.set(sc.nama_mk, {
                nama_mk: sc.nama_mk,
                sks: sc.sks,
                nilai: sc.nilai,
                semester: target_semester
            });
        });

        const allCourses = Array.from(courseHistoryMap.values());
        const cumulativeStats = calculateStats(allCourses);

        // 4. Build Trend Data
        const semesterGroups = {};
        existingGrades.forEach(g => {
             const sem = g.semester;
             if (!semesterGroups[sem]) semesterGroups[sem] = [];
             semesterGroups[sem].push(g);
        });
        
        semesterGroups[target_semester] = simulated_courses;

        const trendGraph = [];
        const sortedSemesters = Object.keys(semesterGroups).sort((a,b) => parseInt(a) - parseInt(b));

        let runningTotalPoints = 0;
        let runningTotalSKS = 0;

        sortedSemesters.forEach(sem => {
             const coursesInSem = semesterGroups[sem];
             const semStats = calculateStats(coursesInSem);
             
             coursesInSem.forEach(c => {
                 const val = gradeMap[c.nilai] || 0;
                 runningTotalPoints += (c.sks * val);
                 runningTotalSKS += c.sks;
             });
             
             const currentIPK = runningTotalSKS > 0 ? (runningTotalPoints / runningTotalSKS).toFixed(2) : 0;

             trendGraph.push({
                 semester: sem,
                 ips: semStats.ip,
                 ipk_cumulative: currentIPK,
                 is_simulated: parseInt(sem) === parseInt(target_semester)
             });
        });

        // Save Simulation State (Persist until End Session)
        const calculationResult = {
            semester_simulation: {
                sks_taken: semesterSimulationStats.totalSKS,
                sks_passed: semesterSimulationStats.sksLulus,
                ips: parseFloat(semesterSimulationStats.ip)
            },
            cumulative_simulation: {
                total_sks_taken: cumulativeStats.totalSKS,
                total_sks_passed: cumulativeStats.sksLulus,
                ipk: parseFloat(cumulativeStats.ip)
            },
            trend_graph: trendGraph
        };

        await Simulation.findOneAndUpdate(
            { student: studentId },
            {
                student: studentId,
                target_semester: target_semester,
                study_plan: study_plan || 'Reguler',
                simulated_courses: simulated_courses,
                last_calculated: {
                    ips: calculationResult.semester_simulation.ips,
                    ipk_cumulative: calculationResult.cumulative_simulation.ipk,
                    sks_taken: calculationResult.semester_simulation.sks_taken,
                    sks_passed: calculationResult.semester_simulation.sks_passed
                }
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            error: false,
            message: "Simulasi berhasil dihitung dan disimpan sementara.",
            data: calculationResult
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            error: true,
            message: error.message 
        });
    }
};

// @desc    Get default study plan for simulation
// @route   GET /api/simulation/plan?semester=X&study_plan=Y
// @access  Private
const getSimulationPlan = async (req, res) => {
    try {
        let targetSemester = parseInt(req.query.semester);
        const studyPlan = req.query.study_plan || 'Reguler'; // Default Reguler

        if (!targetSemester || isNaN(targetSemester)) {
             return res.status(400).json({
                success: false,
                error: true,
                message: "Parameter semester diperlukan."
            });
        }

        // Query based on Study Plan
        const query = {};
        if (studyPlan === 'Fast Track') {
            query.semester_fast_track = targetSemester;
        } else {
            query.semester_reguler = targetSemester; // Default Reguler
        }

        // Fallback to legacy 'semester' if new fields empty (for backward compatibility during seed transition)
        // Or strictly verify new fields.
        const courses = await Course.find({ 
            $or: [
                query,
                { semester: targetSemester } // Legacy/Fallback
            ]
        }).select('nama_mk sks tingkat status_mk semester_reguler semester_fast_track');

        // Filter based on plan if query was mixed
        const filteredCourses = courses.filter(c => {
            if (studyPlan === 'Fast Track') return c.semester_fast_track === targetSemester || (!c.semester_fast_track && c.semester === targetSemester);
            return c.semester_reguler === targetSemester || (!c.semester_reguler && c.semester === targetSemester);
        });

        if (filteredCourses.length === 0) {
             return res.status(200).json({
                success: true,
                message: `Tidak ada rencana studi default untuk semester ${targetSemester} (${studyPlan}).`,
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: `Rencana studi semester ${targetSemester} (${studyPlan}) berhasil diambil.`,
            data: filteredCourses
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: true,
            message: error.message 
        });
    }
};

// @desc    End simulation session
// @route   POST /api/simulation/end-session
// @access  Private
const endSession = async (req, res) => {
    try {
        await Simulation.findOneAndDelete({ student: req.student._id });
        
        res.status(200).json({
            success: true,
            error: false,
            message: "Sesi simulasi telah diakhiri dan data sementara dihapus."
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { calculateSimulation, endSession, getSimulationPlan };
