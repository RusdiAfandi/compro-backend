const axios = require('axios');

async function testCourses() {
  try {
    // Login first
    const login = await axios.post('http://localhost:5001/api/auth/login', {
      nim: '1301221234',
      password: '1301221234'
    });
    
    const token = login.data.data.token;
    console.log('Login successful');
    
    // Get courses
    const courses = await axios.get('http://localhost:5001/api/courses', {
      headers: { Authorization: 'Bearer ' + token }
    });
    
    console.log('Total courses:', courses.data.data.length);
    console.log('\nSample courses:');
    courses.data.data.slice(0, 10).forEach((c, i) => {
      console.log(`${i+1}. ${c.nama_mk} (${c.tingkat}) - ${c.sks} SKS`);
    });
    
    // Test with filter
    const tingkat2 = await axios.get('http://localhost:5001/api/courses?tingkat=2', {
      headers: { Authorization: 'Bearer ' + token }
    });
    
    console.log('\nTingkat II courses:', tingkat2.data.data.length);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCourses();