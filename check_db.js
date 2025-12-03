require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Student = require('./src/models/Student');
const Course = require('./src/models/Course');
const Grade = require('./src/models/Grade');

const checkData = async () => {
  try {
    await connectDB();

    const fs = require('fs');
    const logFile = 'db_dump.txt';
    
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    fs.writeFileSync(logFile, 'DB Dump Start\n');

    log('\n--- Database Statistics ---');
    const studentCount = await Student.countDocuments();
    const courseCount = await Course.countDocuments();
    const gradeCount = await Grade.countDocuments();
    log(`Students: ${studentCount}`);
    log(`Courses: ${courseCount}`);
    log(`Grades: ${gradeCount}`);

    log('\n--- Sample Student ---');
    const student = await Student.findOne().lean();
    log(JSON.stringify(student, null, 2));

    log('\n--- Sample Course (With Semester?) ---');
    // Try to find a course that SHOULD have a semester (e.g. from Study Plan)
    const courseWithSem = await Course.findOne({ semester: { $exists: true, $ne: null } }).lean();
    if (courseWithSem) {
        log("Course with Semester found:");
        log(JSON.stringify(courseWithSem, null, 2));
    } else {
        log("WARNING: No courses found with 'semester' field set!");
        // Print a random course to see what it looks like
        const randomCourse = await Course.findOne().lean();
        log("Random Course:");
        log(JSON.stringify(randomCourse, null, 2));
    }

    log('\n--- Sample Grade ---');
    const grade = await Grade.findOne().lean();
    log(JSON.stringify(grade, null, 2));

    process.exit();
  } catch (error) {
    console.error('Error checking DB:', error);
    process.exit(1);
  }
};

checkData();
