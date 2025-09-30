const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testDashboardIntegration() {
  try {
    console.log('🧪 Testing Dashboard Integration...\n');

    // 1. Create a session
    console.log('1. Creating session...');
    const sessionResponse = await axios.post(`${API_BASE}/sessions`);
    const sessionId = sessionResponse.data.session.id;
    console.log(`✅ Session created: ${sessionId}\n`);

    // 2. Test dashboard data endpoint
    console.log('2. Testing dashboard data endpoint...');
    const dashboardResponse = await axios.get(`${API_BASE}/dashboard/${sessionId}`);
    console.log('✅ Dashboard data retrieved:', JSON.stringify(dashboardResponse.data, null, 2));
    console.log();

    // 3. Submit a mood entry
    console.log('3. Submitting mood entry...');
    const moodData = {
      sessionId,
      mood: 8,
      energy: 7,
      stress: 3,
      anxiety: 2,
      sleep: 8,
      notes: 'Feeling good today!'
    };
    const moodResponse = await axios.post(`${API_BASE}/dashboard/mood/entry`, moodData);
    console.log('✅ Mood entry submitted:', JSON.stringify(moodResponse.data, null, 2));
    console.log();

    // 4. Log an activity
    console.log('4. Logging activity...');
    const activityData = {
      sessionId,
      type: 'chat',
      title: 'AI Assistant Chat',
      description: 'Had a conversation about stress management',
      metadata: { duration: 300, topics: ['stress', 'coping'] }
    };
    const activityResponse = await axios.post(`${API_BASE}/dashboard/activities`, activityData);
    console.log('✅ Activity logged:', JSON.stringify(activityResponse.data, null, 2));
    console.log();

    // 5. Get updated dashboard data
    console.log('5. Getting updated dashboard data...');
    const updatedDashboardResponse = await axios.get(`${API_BASE}/dashboard/${sessionId}`);
    console.log('✅ Updated dashboard data:', JSON.stringify(updatedDashboardResponse.data, null, 2));
    console.log();

    // 6. Get achievements
    console.log('6. Getting achievements...');
    const achievementsResponse = await axios.get(`${API_BASE}/dashboard/achievements/${sessionId}`);
    console.log('✅ Achievements:', JSON.stringify(achievementsResponse.data, null, 2));
    console.log();

    // 7. Get progress metrics
    console.log('7. Getting progress metrics...');
    const progressResponse = await axios.get(`${API_BASE}/dashboard/progress/${sessionId}`);
    console.log('✅ Progress metrics:', JSON.stringify(progressResponse.data, null, 2));
    console.log();

    console.log('🎉 All dashboard integration tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      console.log('💡 Tip: Make sure the backend server is running with dashboard routes enabled');
    }
  }
}

// Run the test
testDashboardIntegration();