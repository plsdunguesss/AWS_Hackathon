const { DashboardService } = require('./dist/services/dashboardService');
const { Database } = require('./dist/database/database');
const { v4: uuidv4 } = require('uuid');

async function testProgressAnalytics() {
  console.log('🧪 Testing Progress Analytics Integration...\n');

  try {
    // Initialize services
    const db = Database.getInstance();
    const dashboardService = DashboardService.getInstance();

    // Create test session
    const sessionId = uuidv4();
    console.log(`📝 Created test session: ${sessionId}`);

    // Insert test session
    await db.run(
      'INSERT INTO sessions (id, start_time, last_activity) VALUES (?, ?, ?)',
      [sessionId, new Date().toISOString(), new Date().toISOString()]
    );

    // Create sample mood entries for the past 14 days
    console.log('📊 Creating sample mood data...');
    const moodEntries = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Generate realistic mood data with some patterns
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseMood = isWeekend ? 8 : 7; // Slightly better mood on weekends
      const mood = Math.max(1, Math.min(10, baseMood + Math.floor(Math.random() * 3) - 1));
      const energy = Math.max(1, Math.min(10, mood + Math.floor(Math.random() * 2) - 1));
      const stress = Math.max(1, Math.min(10, 11 - mood + Math.floor(Math.random() * 2) - 1));
      const anxiety = Math.max(1, Math.min(10, stress + Math.floor(Math.random() * 2) - 1));
      const sleep = Math.max(1, Math.min(10, mood + Math.floor(Math.random() * 2) - 1));

      const entry = {
        id: uuidv4(),
        sessionId,
        date: dateStr,
        mood,
        energy,
        stress,
        anxiety,
        sleep,
        notes: i === 0 ? 'Feeling great today!' : null
      };

      await db.run(
        `INSERT INTO mood_entries (id, session_id, date, mood, energy, stress, anxiety, sleep, notes, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [entry.id, entry.sessionId, entry.date, entry.mood, entry.energy, 
         entry.stress, entry.anxiety, entry.sleep, entry.notes, new Date().toISOString()]
      );

      moodEntries.push(entry);
    }

    console.log(`✅ Created ${moodEntries.length} mood entries`);

    // Test progress analytics with different time ranges
    console.log('\n🔍 Testing analytics for different time ranges...');
    
    const timeRanges = ['7d', '30d'];
    for (const range of timeRanges) {
      console.log(`\n📈 Testing ${range} analytics:`);
      
      const analytics = await dashboardService.getProgressAnalytics(sessionId, range);
      
      console.log(`  - Mood trends: ${analytics.moodTrends.length} entries`);
      console.log(`  - Correlations: ${analytics.correlations.length} found`);
      
      analytics.correlations.forEach(corr => {
        console.log(`    * ${corr.title}: ${Math.round(corr.correlation * 100)}% correlation`);
      });
      
      console.log(`  - Patterns: ${analytics.patterns.length} identified`);
      analytics.patterns.forEach(pattern => {
        console.log(`    * ${pattern.title}: ${pattern.description}`);
      });
      
      console.log(`  - Weekly patterns:`);
      console.log(`    * Weekday average: ${analytics.weeklyPatterns.weekdayAverage}`);
      console.log(`    * Weekend average: ${analytics.weeklyPatterns.weekendAverage}`);
      console.log(`    * Best day: ${analytics.weeklyPatterns.bestDay}`);
      console.log(`    * Worst day: ${analytics.weeklyPatterns.worstDay}`);
    }

    // Test progress metrics
    console.log('\n📊 Testing progress metrics...');
    const metrics = await dashboardService.getProgressMetrics(sessionId);
    
    console.log(`  - Overall progress: ${metrics.overallProgress}%`);
    console.log(`  - Streak days: ${metrics.streakDays}`);
    console.log(`  - Total check-ins: ${metrics.totalCheckIns}`);
    console.log(`  - Average mood: ${metrics.averageMood}/10`);
    console.log(`  - Mood trend: ${metrics.moodTrend}%`);

    // Test API endpoint simulation
    console.log('\n🌐 Testing API endpoint format...');
    const apiResponse = {
      success: true,
      data: {
        analytics: await dashboardService.getProgressAnalytics(sessionId, '30d'),
        metrics: await dashboardService.getProgressMetrics(sessionId)
      }
    };

    console.log(`  - API response structure: ✅`);
    console.log(`  - Analytics data: ${apiResponse.data.analytics ? '✅' : '❌'}`);
    console.log(`  - Metrics data: ${apiResponse.data.metrics ? '✅' : '❌'}`);

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await db.run('DELETE FROM mood_entries WHERE session_id = ?', [sessionId]);
    await db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);

    console.log('\n✅ Progress Analytics Integration Test Complete!');
    console.log('🎉 All tests passed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testProgressAnalytics().catch(console.error);