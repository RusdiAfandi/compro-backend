require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const connectDB = require('./src/config/db');
const Student = require('./src/models/Student');
const Course = require('./src/models/Course');
const Grade = require('./src/models/Grade');

const importData = async () => {
  try {
    await connectDB();

    console.log('Deleting existing data...');
    await Student.deleteMany({});
    await Course.deleteMany({});
    await Grade.deleteMany({});

    console.log('Reading JSON files...');
    const dataPath = path.join(__dirname, 'data_json');
    
    // Read files
    const studentsData = JSON.parse(fs.readFileSync(path.join(dataPath, 'Data_Mahasiswa.json'), 'utf-8'));
    const coursesData = JSON.parse(fs.readFileSync(path.join(dataPath, 'Nama_MK_All.json'), 'utf-8'));
    const studyPlanFastTrack = JSON.parse(fs.readFileSync(path.join(dataPath, 'Study_Plan_Fast_Track.json'), 'utf-8'));
    const studyPlanReguler = JSON.parse(fs.readFileSync(path.join(dataPath, 'Study_Plan_Reguler.json'), 'utf-8'));
    
    const tingkat1Data = JSON.parse(fs.readFileSync(path.join(dataPath, 'Tingkat_1.json'), 'utf-8'));
    const tingkat2Data = JSON.parse(fs.readFileSync(path.join(dataPath, 'Tingkat_2.json'), 'utf-8'));
    const tingkat3Data = JSON.parse(fs.readFileSync(path.join(dataPath, 'Tingkat_3.json'), 'utf-8'));

    console.log('Importing Courses...');
    // Consolidate Course Data
    const allCoursesMap = new Map();

    const processCourse = (c, source) => {
        const name = c["NAMA MK"] || c["Nama MK"];
        const semester = c["Semester"] ? parseInt(c["Semester"]) : undefined;
        
        let course = allCoursesMap.get(name);
        if (!course) {
            course = {
                nama_mk: name,
                nama_mk_en: c["Nama MK (EN)"],
                sks: parseInt(c["SKS"]),
                tingkat: c["TINGKAT"] || "UNKNOWN",
                status_mk: c["Status MK"],
                is_elective: (c["TINGKAT"] === 'MK PILIHAN' || name === 'MK Pilihan'),
                semester_reguler: undefined,
                semester_fast_track: undefined
            };
            allCoursesMap.set(name, course);
        }

        if (source === 'Reguler' && semester) {
            course.semester_reguler = semester;
        }
        if (source === 'FastTrack' && semester) {
            course.semester_fast_track = semester;
        }
        
        // Fallback/Legacy semester field (optional)
        if (semester && !course.semester) {
            course.semester = semester;
        }
    };

    coursesData.forEach(c => processCourse(c, 'Master'));
    studyPlanFastTrack.forEach(c => processCourse(c, 'FastTrack'));
    studyPlanReguler.forEach(c => processCourse(c, 'Reguler'));

    const coursesToInsert = Array.from(allCoursesMap.values());
    const createdCourses = await Course.insertMany(coursesToInsert);
    console.log(`Imported ${createdCourses.length} courses`);

    // Create a quick lookup map for course ObjectIDs
    const courseLookup = {};
    createdCourses.forEach(c => {
        courseLookup[c.nama_mk] = c._id;
    });

    console.log('Importing Students and Grades...');
    for (const s of studentsData) {
        // Create Student
        // Default password same as NIM for simplicity as requested
        const student = new Student({
            nim: s.NIM,
            password: s.NIM, 
            nama: s.Nama,
            email_sso: s["Email SSO"],
            jurusan: s.Jurusan,
            fakultas: s.Fakultas,
            angkatan: parseInt(s.Angkatan),
            sks_total: parseInt(s["SKS Total"]) || 0,
            ipk: parseFloat(s.IPK) || 0,
            tak: parseInt(s.TAK) || 0,
            ikk: parseFloat(s.IKK) || 0,
            sks_tingkat: {
                tingkat_1: s["SKS Tingkat I"],
                tingkat_2: s["SKS Tingkat II"],
                tingkat_3: s["SKS Tingkat III"],
                tingkat_4: s["SKS Tingkat IV"],
            },
            ip_tingkat: {
                tingkat_1: s["IP Tingkat I"],
                tingkat_2: s["IP Tingkat II"],
                tingkat_3: s["IP Tingkat III"],
                tingkat_4: s["IP TIngkat IV"],
            }
        });

        const createdStudent = await student.save();

        // Aggregate grades for this student
        const studentGrades = [
            ...tingkat1Data.filter(g => g.Nama === s.Nama),
            ...tingkat2Data.filter(g => g.Nama === s.Nama),
            ...tingkat3Data.filter(g => g.Nama === s.Nama)
        ];

        // Insert Grades
        const gradeDocs = studentGrades.map(g => {
            const courseName = g["MK yang Pernah Diambil"];
            return {
                student: createdStudent._id,
                course: courseLookup[courseName], // might be undefined if exact name match fails, handled in model
                nama_mk: courseName,
                sks: parseInt(g.SKS),
                nilai: g.Nilai,
                semester: g.Semester
            };
        });

        if (gradeDocs.length > 0) {
            await Grade.insertMany(gradeDocs);
        }
    }
    
    console.log(`Imported ${studentsData.length} students and their grades`);
    console.log('Data Import Success!');
    process.exit();
  } catch (error) {
    console.error('Error with data import', error);
    process.exit(1);
  }
};

importData();
