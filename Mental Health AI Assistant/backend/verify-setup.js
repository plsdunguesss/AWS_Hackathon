// Verify backend setup without starting the server
const fs = require('fs');
const path = require('path');

console.log('Verifying Mental Health AI Assistant Backend Setup...\n');

// Check if all required files exist
const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'src/server.ts',
    'src/database/database.ts',
    'src/database/schema.sql',
    'src/types/index.ts',
    'src/services/ollamaService.ts',
    'src/routes/health.ts',
    'src/routes/session.ts',
    'src/routes/conversation.ts',
    'src/routes/riskAssessment.ts'
];

console.log('1. Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing!');
    process.exit(1);
}

// Check if node_modules exists
console.log('\n2. Checking dependencies...');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('✅ Dependencies installed (node_modules exists)');
} else {
    console.log('❌ Dependencies not installed - run "npm install"');
}

// Check if dist directory exists (compiled code)
console.log('\n3. Checking compiled code...');
if (fs.existsSync(path.join(__dirname, 'dist'))) {
    console.log('✅ TypeScript compiled successfully (dist directory exists)');
} else {
    console.log('⚠️ TypeScript not compiled - run "npm run build"');
}

// Test database initialization
console.log('\n4. Testing database initialization...');
try {
    // Import and test database
    const Database = require('./dist/database/database').Database;
    const db = Database.getInstance();
    
    db.initialize().then(() => {
        console.log('✅ Database initialized successfully');
        
        // Test basic database operations
        return db.get('SELECT 1 as test');
    }).then((result) => {
        if (result && result.test === 1) {
            console.log('✅ Database connection working');
        }
        
        return db.close();
    }).then(() => {
        console.log('✅ Database closed successfully');
        console.log('\n🎉 Backend setup verification complete!');
        console.log('\nTo start the server, run:');
        console.log('  npm run dev');
        console.log('\nTo test Ollama integration, make sure Ollama is running:');
        console.log('  ollama serve');
        console.log('  ollama pull llama2:7b');
    }).catch((error) => {
        console.log('❌ Database test failed:', error.message);
    });
    
} catch (error) {
    console.log('❌ Could not test database - make sure to run "npm run build" first');
    console.log('Error:', error.message);
}