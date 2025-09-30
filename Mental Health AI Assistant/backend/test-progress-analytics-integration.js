const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

// Test session ID (you can replace this with a real session ID)
const TEST_SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';

async function testProgressAnalyticsEndpoints() {
  console.log('🧪 Testing Progress Analytics Integration...\n');

  const tests = [
    {
      name: 'Advanced Analytics',
      endpoint: `/progress-analytics/advanced/${TEST_SESSION_ID}?range=30d`,
      method: 'GET'
    },
    {
      name: 'Correlation Analysis',
      endpoint: `/progress-analytics/correlations/${TEST_SESSION_ID}?range=30d`,
      method: 'GET'
    },
    {
      name: 'Pattern Detection',
      endpoint: `/progress-analytics/patterns/${TEST_SESSION_ID}?range=30d`,
      method: 'GET'
    },
    {
      name: 'Milestone Tracking',
      endpoint: `/progress-analytics/milestones/${TEST_SESSION_ID}`,
      method: 'GET'
    },
    {
      name: 'Visualization Data',
      endpoint: `/progress-analytics/visualization/${TEST_SESSION_ID}?range=30d`,
      method: 'GET'
    },
    {
      name: 'Trend Analysis',
      endpoint: `/progress-analytics/trends/${TEST_SESSION_ID}?range=30d`,
      method: 'GET'
    },
    {
      name: 'Insights and Recommendations',
      endpoint: `/progress-analytics/insights/${TEST_SESSION_ID}?range=30d`,
      method: 'GET'
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      
      const response = await fetch(`${API_BASE_URL}${test.endpoint}`, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ ${test.name}: SUCCESS`);
        
        // Log some sample data structure
        if (data.data) {
          if (test.name === 'Advanced Analytics') {
            console.log(`   - Correlations: ${data.data.correlations?.length || 0}`);
            console.log(`   - Patterns: ${data.data.patterns?.length || 0}`);
            console.log(`   - Trends: ${data.data.trends?.length || 0}`);
            console.log(`   - Milestones: ${data.data.milestones?.length || 0}`);
            console.log(`   - Risk Factors: ${data.data.riskFactors?.length || 0}`);
          } else if (test.name === 'Correlation Analysis') {
            console.log(`   - Found ${data.data.correlations?.length || 0} correlations`);
            if (data.data.correlations?.length > 0) {
              const firstCorr = data.data.correlations[0];
              console.log(`   - Sample: ${firstCorr.title} (${firstCorr.correlation.toFixed(2)})`);
            }
          } else if (test.name === 'Pattern Detection') {
            console.log(`   - Found ${data.data.patterns?.length || 0} patterns`);
            if (data.data.patterns?.length > 0) {
              const firstPattern = data.data.patterns[0];
              console.log(`   - Sample: ${firstPattern.title} (${Math.round(firstPattern.confidence * 100)}% confidence)`);
            }
          } else if (test.name === 'Milestone Tracking') {
            console.log(`   - Found ${data.data.milestones?.length || 0} milestones`);
            if (data.data.milestones?.length > 0) {
              const firstMilestone = data.data.milestones[0];
              console.log(`   - Sample: ${firstMilestone.title} (${Math.round(firstMilestone.progress)}% complete)`);
            }
          } else if (test.name === 'Visualization Data') {
            console.log(`   - Chart datasets: ${data.data.chartData?.datasets?.length || 0}`);
            console.log(`   - Insights: ${data.data.insights?.length || 0}`);
            console.log(`   - Recommendations: ${data.data.recommendations?.length || 0}`);
          } else if (test.name === 'Trend Analysis') {
            console.log(`   - Trends: ${data.data.trends?.length || 0}`);
            console.log(`   - Risk Factors: ${data.data.riskFactors?.length || 0}`);
          } else if (test.name === 'Insights and Recommendations') {
            console.log(`   - Insights: ${data.data.insights?.length || 0}`);
            console.log(`   - Recommendations: ${data.data.recommendations?.length || 0}`);
            console.log(`   - Patterns: ${data.data.patterns?.length || 0}`);
          }
        }
        
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR`);
      console.log(`   ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All progress analytics endpoints are working correctly!');
  } else {
    console.log('⚠️  Some tests failed. Check the backend server and database.');
  }

  return passedTests === totalTests;
}

// Test with sample data creation
async function createSampleData() {
  console.log('📝 Creating sample data for testing...\n');

  try {
    // Create a session first
    const sessionResponse = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!sessionResponse.ok) {
      console.log('❌ Failed to create test session');
      return null;
    }

    const sessionData = await sessionResponse.json();
    const sessionId = sessionData.data.session.id;
    console.log(`✅ Created test session: ${sessionId}`);

    // Create some sample mood entries
    const moodEntries = [
      { mood: 7, energy: 6, stress: 4, anxiety: 3, sleep: 8, notes: 'Good day overall' },
      { mood: 6, energy: 5, stress: 6, anxiety: 5, sleep: 6, notes: 'Bit stressed at work' },
      { mood: 8, energy: 7, stress: 3, anxiety: 2, sleep: 9, notes: 'Great sleep, feeling energetic' },
      { mood: 5, energy: 4, stress: 7, anxiety: 6, sleep: 5, notes: 'Challenging day' },
      { mood: 9, energy: 8, stress: 2, anxiety: 1, sleep: 8, notes: 'Excellent mood today' }
    ];

    for (let i = 0; i < moodEntries.length; i++) {
      const entry = moodEntries[i];
      const response = await fetch(`${API_BASE_URL}/dashboard/mood/entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          ...entry
        })
      });

      if (response.ok) {
        console.log(`✅ Created mood entry ${i + 1}`);
      } else {
        console.log(`❌ Failed to create mood entry ${i + 1}`);
      }
    }

    // Create some sample activities
    const activities = [
      { type: 'chat', title: 'AI Conversation', description: 'Had a supportive chat with AI assistant' },
      { type: 'resource', title: 'Mindfulness Exercise', description: 'Completed 10-minute meditation' },
      { type: 'assessment', title: 'Mental Health Check', description: 'Completed weekly assessment' }
    ];

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      const response = await fetch(`${API_BASE_URL}/dashboard/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          ...activity
        })
      });

      if (response.ok) {
        console.log(`✅ Created activity ${i + 1}`);
      } else {
        console.log(`❌ Failed to create activity ${i + 1}`);
      }
    }

    console.log(`\n✅ Sample data created for session: ${sessionId}\n`);
    return sessionId;

  } catch (error) {
    console.log(`❌ Error creating sample data: ${error.message}`);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Progress Analytics Integration Tests\n');

  // First, test with existing session
  console.log('Testing with existing session ID...');
  await testProgressAnalyticsEndpoints();

  // Then create sample data and test again
  console.log('\n' + '='.repeat(60) + '\n');
  const sampleSessionId = await createSampleData();
  
  if (sampleSessionId) {
    // Update the test session ID to use the one with sample data
    global.TEST_SESSION_ID = sampleSessionId;
    
    console.log('Testing with sample data session...');
    await testProgressAnalyticsEndpoints();
  }

  console.log('\n🏁 Progress Analytics Integration Tests Complete');
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testProgressAnalyticsEndpoints, createSampleData };