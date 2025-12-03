const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:5001/api';
const logFile = 'test_results.txt';

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
};

const runTests = async () => {
  fs.writeFileSync(logFile, 'Test Started\n');
  try {
    log('0. Testing Registration...');
    const randomNim = '1999' + Math.floor(Math.random() * 10000);
    try {
        const regRes = await axios.post(`${BASE_URL}/auth/register`, {
            nim: randomNim,
            nama: 'Test User',
            email_sso: `test${randomNim}@student.telkomuniversity.ac.id`,
            password: 'password123',
            jurusan: 'S1 Informatika'
        });
        log('Registration Success! Name: ' + regRes.data.data.nama);
    } catch (e) {
        log('Registration Failed: ' + (e.response ? JSON.stringify(e.response.data) : e.message));
    }

    log('1. Testing Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      nim: '1301221234',
      password: '1301221234'
    });
    
    const token = loginRes.data.data.token;
    log('Login Success! Token received.');
    log('User: ' + loginRes.data.data.nama);

    log('\n2. Testing Course Search...');
    const coursesRes = await axios.get(`${BASE_URL}/courses?keyword=Algoritma&tingkat=1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    log(`Found ${coursesRes.data.data.length} courses matching "Algoritma" and "Tingkat 1"`);
    log('Sample Course: ' + coursesRes.data.data[0]?.nama_mk);

    log('\n2b. Testing Course Search by Tingkat Only...');
    const coursesByTingkat = await axios.get(`${BASE_URL}/courses?tingkat=3`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    log(`Found ${coursesByTingkat.data.data.length} courses for Tingkat 3`);

    log('\n3. Testing Simulation Plan (FR04.1)...');
    
    // Test Semester 5 Reguler
    const simPlanRes5 = await axios.get(`${BASE_URL}/simulation/plan?semester=5&study_plan=Reguler`, { headers: { Authorization: `Bearer ${token}` } });
    log('Simulation Plan (Reguler, Sem 5): ' + simPlanRes5.data.data.length + ' courses');

    // Test Semester 5 Fast Track
    const simPlanRes5FT = await axios.get(`${BASE_URL}/simulation/plan?semester=5&study_plan=Fast Track`, { headers: { Authorization: `Bearer ${token}` } });
    log('Simulation Plan (Fast Track, Sem 5): ' + simPlanRes5FT.data.data.length + ' courses');

    log('\n3b. Testing Simulation Calculation...');
    const simulationPayload = {
        target_semester: 5,
        study_plan: 'Reguler',
        simulated_courses: [
            { nama_mk: 'Keamanan Siber', sks: 3, nilai: 'A' },
            { nama_mk: 'Kecerdasan Artifisial', sks: 3, nilai: 'A' },
            { nama_mk: 'Komputasi Awan dan Terdistribusi', sks: 3, nilai: 'AB' }
        ]
    };

    const simRes = await axios.post(`${BASE_URL}/simulation/calculate`, simulationPayload, {
        headers: { Authorization: `Bearer ${token}` }
    });

    log('Simulation Result:');
    log('Semester IPS: ' + simRes.data.data.semester_simulation.ips);
    log('Cumulative IPK: ' + simRes.data.data.cumulative_simulation.ipk);
    log('Trend Graph Points: ' + simRes.data.data.trend_graph.length);

    log('\n4. Testing Error Scenarios...');
    
    // Scenario 1: Empty List
    try {
        log('Testing Empty List (Expect 400)...');
        await axios.post(`${BASE_URL}/simulation/calculate`, {
            target_semester: 5,
            simulated_courses: []
        }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
        log('Got: ' + e.response.status + ' - ' + e.response.data.message);
    }

    // Scenario 4: Missing Grades
    try {
        log('Testing Missing Grades (Expect 400)...');
        await axios.post(`${BASE_URL}/simulation/calculate`, {
            target_semester: 5,
            simulated_courses: [{ nama_mk: 'Test', sks: 3 }]
        }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
        log('Got: ' + e.response.status + ' - ' + e.response.data.message);
    }

    // Scenario 5: Malformed Data
    try {
        log('Testing Malformed Data (Expect 422)...');
        await axios.post(`${BASE_URL}/simulation/calculate`, {
            target_semester: 5,
            simulated_courses: null
        }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
        log('Got: ' + e.response.status + ' - ' + e.response.data.message);
    }

    // Scenario 6: End Session
    log('Testing End Session (Expect 200)...');
    const endRes = await axios.post(`${BASE_URL}/simulation/end-session`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
    });
    log('End Session: ' + endRes.data.message);

    log('\n5. Testing Menu Endpoint (FR02)...');
    const menuRes = await axios.get(`${BASE_URL}/menu`, { headers: { Authorization: `Bearer ${token}` } });
    log('Menu Message: ' + menuRes.data.message);
    log('Profile Name: ' + menuRes.data.data.profile.nama);

    log('\n6. Testing Interests (FR03)...');
    // Update
    await axios.post(`${BASE_URL}/interests`, {
        hard_skills: ['Machine Learning', 'Python'],
        soft_skills: ['Communication']
    }, { headers: { Authorization: `Bearer ${token}` } });
    log('Interests Updated.');

    log('6a. Testing Get Interests (FR03)...');
    const getIntRes = await axios.get(`${BASE_URL}/interests`, { headers: { Authorization: `Bearer ${token}` } });
    log('Available Skills: ' + getIntRes.data.data.available_options.hard_skills.length + ' items');
    log('User Selection: ' + getIntRes.data.data.user_interests.hard_skills[0]);

    // Recommend
    try {
        const recRes = await axios.post(`${BASE_URL}/interests/recommend`, {}, { headers: { Authorization: `Bearer ${token}` } });
        if (recRes.data.data && recRes.data.data.recommendations) {
            log('AI Recommendation: ' + recRes.data.data.recommendations[0].name);
        } else {
            log('AI Recommendation Response (No Recs): ' + JSON.stringify(recRes.data));
        }
    } catch (e) {
        log('AI Recommendation Status: ' + e.response.status);
        if (e.response && e.response.data) {
            log('Error Message: ' + JSON.stringify(e.response.data));
        }
    }

    log('\n7. Testing Swagger Documentation...');
    const swaggerRes = await axios.get(`${BASE_URL.replace('/api', '')}/api-docs`);
    log('Swagger UI Status: ' + swaggerRes.status);

  } catch (error) {
    log('Test Failed: ' + error.message);
    if (error.response) {
        log('Status: ' + error.response.status);
        log('Data: ' + JSON.stringify(error.response.data));
    }
  }
};

runTests();
