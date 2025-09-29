const { SessionService } = require('./dist/services/sessionService');
const { Database } = require('./dist/database/database');

async function testSessionManagement() {
    console.log('🧪 Testing Session Management...\n');

    try {
        // Initialize database
        console.log('📊 Initializing database...');
        const db = Database.getInstance();
        await db.initialize();
        console.log('✅ Database initialized\n');

        // Get session service
        const sessionService = SessionService.getInstance();

        // Test 1: Create a new session
        console.log('🆕 Creating new session...');
        const session = await sessionService.createSession();
        console.log(`✅ Session created: ${session.id}`);
        console.log(`   Risk Score: ${session.riskScore}`);
        console.log(`   Referral Triggered: ${session.referralTriggered}\n`);

        // Test 2: Store messages
        console.log('💬 Storing messages...');
        const userMessage = await sessionService.storeMessage(
            session.id,
            'I have been feeling really anxious lately and having trouble sleeping',
            'user'
        );
        console.log(`✅ User message stored: ${userMessage.id}`);

        const aiMessage = await sessionService.storeMessage(
            session.id,
            'I hear that you\'ve been feeling anxious and having sleep difficulties. That sounds really challenging. Anxiety can definitely impact our sleep patterns. Can you tell me more about when these feelings started?',
            'assistant',
            0.82
        );
        console.log(`✅ AI message stored: ${aiMessage.id} (empathy: ${aiMessage.empathyScore})\n`);

        // Test 3: Store risk assessment
        console.log('⚠️ Storing risk assessment...');
        const riskScore = {
            overallRisk: 35,
            indicators: {
                depressionMarkers: 0.3,
                anxietyMarkers: 0.7,
                selfHarmRisk: 0.1,
                suicidalIdeation: 0.0,
                socialIsolation: 0.2
            },
            confidence: 0.8,
            recommendsProfessionalHelp: false
        };

        await sessionService.storeRiskAssessment(session.id, riskScore, aiMessage.id);
        console.log('✅ Risk assessment stored');

        // Test 4: Update session risk score
        await sessionService.updateRiskScore(session.id, 0.35, false);
        console.log('✅ Session risk score updated\n');

        // Test 5: Get conversation history
        console.log('📜 Getting conversation history...');
        const history = await sessionService.getConversationHistory(session.id);
        console.log(`✅ Retrieved ${history.length} messages:`);
        history.forEach((msg, index) => {
            console.log(`   ${index + 1}. [${msg.sender}]: ${msg.content.substring(0, 50)}...`);
        });
        console.log();

        // Test 6: Get conversation context
        console.log('🔍 Getting conversation context...');
        const context = await sessionService.getConversationContext(session.id);
        console.log(`✅ Context retrieved:`);
        console.log(`   Session ID: ${context.sessionId}`);
        console.log(`   Current Risk Score: ${context.currentRiskScore}`);
        console.log(`   Message History Length: ${context.messageHistory.length}\n`);

        // Test 7: Get latest risk assessment
        console.log('📊 Getting latest risk assessment...');
        const latestRisk = await sessionService.getLatestRiskAssessment(session.id);
        console.log(`✅ Latest risk assessment:`);
        console.log(`   Overall Risk: ${latestRisk.overallRisk}%`);
        console.log(`   Depression: ${latestRisk.depressionMarkers}`);
        console.log(`   Anxiety: ${latestRisk.anxietyMarkers}`);
        console.log(`   Confidence: ${latestRisk.confidence}\n`);

        // Test 8: Get session statistics
        console.log('📈 Getting session statistics...');
        const stats = await sessionService.getSessionStats();
        console.log(`✅ Session statistics:`);
        console.log(`   Total Sessions: ${stats.totalSessions}`);
        console.log(`   Active Sessions: ${stats.activeSessions}`);
        console.log(`   Average Risk Score: ${stats.averageRiskScore.toFixed(3)}`);
        console.log(`   High Risk Sessions: ${stats.highRiskSessions}`);
        console.log(`   Referral Triggered: ${stats.referralTriggeredSessions}\n`);

        // Test 9: Test cleanup (create old session)
        console.log('🧹 Testing session cleanup...');
        const oldSession = await sessionService.createSession();
        
        // Manually make it old by updating the database directly
        await db.run(
            'UPDATE sessions SET last_activity = ? WHERE id = ?',
            [new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), oldSession.id]
        );

        const cleanedCount = await sessionService.cleanupOldSessions(24);
        console.log(`✅ Cleaned up ${cleanedCount} old sessions\n`);

        console.log('🎉 All session management tests completed successfully!');

    } catch (error) {
        console.error('❌ Error during testing:', error);
        process.exit(1);
    }
}

// Run the test
testSessionManagement();