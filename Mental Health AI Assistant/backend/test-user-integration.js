// Test user management integration
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testUserManagement() {
  try {
    console.log('Testing User Management Integration...\n');
    
    // Test 1: Create a session first
    console.log('1. Creating test session...');
    const sessionResponse = await axios.post(`${API_BASE}/sessions`);
    const sessionId = sessionResponse.data.session.id;
    console.log(`✓ Session created: ${sessionId}\n`);
    
    // Test 2: Get initial profile (should return defaults)
    console.log('2. Getting initial user profile...');
    const profileResponse = await axios.get(`${API_BASE}/user/profile/${sessionId}`);
    console.log('✓ Profile retrieved:', profileResponse.data.profile);
    console.log();
    
    // Test 3: Update profile
    console.log('3. Updating user profile...');
    const profileUpdate = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      bio: 'Test user for mental health assistant'
    };
    
    const updateResponse = await axios.put(`${API_BASE}/user/profile/${sessionId}`, profileUpdate);
    console.log('✓ Profile updated:', updateResponse.data.profile);
    console.log();
    
    // Test 4: Get preferences
    console.log('4. Getting user preferences...');
    const prefsResponse = await axios.get(`${API_BASE}/user/preferences/${sessionId}`);
    console.log('✓ Preferences retrieved:', prefsResponse.data.preferences);
    console.log();
    
    // Test 5: Update preferences
    console.log('5. Updating user preferences...');
    const prefsUpdate = {
      theme: 'dark',
      language: 'en',
      notifications: {
        checkInReminders: true,
        chatNotifications: false,
        appointmentReminders: true,
        weeklyReports: true,
        emergencyAlerts: true,
        marketingEmails: false
      },
      privacy: {
        dataSharing: false,
        anonymousResearch: true,
        profileVisibility: 'healthcare',
        activityTracking: true
      }
    };
    
    const updatePrefsResponse = await axios.put(`${API_BASE}/user/preferences/${sessionId}`, prefsUpdate);
    console.log('✓ Preferences updated:', updatePrefsResponse.data.preferences);
    console.log();
    
    // Test 6: Export data
    console.log('6. Testing data export...');
    const exportResponse = await axios.post(`${API_BASE}/user/export/${sessionId}`);
    console.log('✓ Data export initiated:', exportResponse.data);
    console.log();
    
    console.log('🎉 All user management tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   cd backend && npm run dev');
    }
  }
}

// Only run if called directly
if (require.main === module) {
  testUserManagement();
}

module.exports = { testUserManagement };