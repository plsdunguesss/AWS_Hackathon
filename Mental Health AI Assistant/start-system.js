// Simple system startup script
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Mental Health AI Assistant System...\n');

// Function to start a process
function startProcess(name, command, args, cwd) {
  console.log(`Starting ${name}...`);
  const process = spawn(command, args, {
    cwd: cwd,
    stdio: 'inherit',
    shell: true
  });

  process.on('error', (error) => {
    console.error(`❌ Error starting ${name}:`, error.message);
  });

  process.on('exit', (code) => {
    console.log(`${name} exited with code ${code}`);
  });

  return process;
}

async function startSystem() {
  try {
    console.log('📋 System Components:');
    console.log('- ✅ Backend API (User Management, Dashboard, Chat)');
    console.log('- ✅ Frontend React App (Settings, Dashboard, Chat)');
    console.log('- ✅ Database (SQLite with user profiles & preferences)');
    console.log('- ✅ Real-time user management integration\n');

    // Start backend server
    console.log('🔧 Starting Backend Server...');
    const backendPath = path.join(__dirname, 'backend');
    
    // Try different methods to start the backend
    try {
      // Method 1: Try ts-node directly
      startProcess('Backend', 'node', [
        path.join(__dirname, 'backend', 'node_modules', '.bin', 'ts-node-dev'),
        '--respawn',
        '--transpile-only',
        'src/server.ts'
      ], backendPath);
    } catch (error) {
      console.log('Trying alternative startup method...');
      // Method 2: Try node with compiled JS (if available)
      startProcess('Backend', 'node', ['dist/server.js'], backendPath);
    }

    // Wait a bit for backend to start
    setTimeout(() => {
      console.log('\n🌐 Starting Frontend...');
      // Start frontend
      startProcess('Frontend', 'npm', ['start'], __dirname);
      
      console.log('\n📱 System URLs:');
      console.log('- Frontend: http://localhost:3000');
      console.log('- Backend API: http://localhost:5000');
      console.log('- Settings Page: http://localhost:3000 (navigate to Settings)');
      
      console.log('\n🧪 Test Features:');
      console.log('1. Navigate to Settings page');
      console.log('2. Update your profile information');
      console.log('3. Change notification preferences');
      console.log('4. Modify privacy settings');
      console.log('5. Try data export functionality');
      console.log('6. Test the dashboard and chat features');
      
    }, 3000);

  } catch (error) {
    console.error('❌ Failed to start system:', error.message);
    console.log('\n💡 Manual startup instructions:');
    console.log('1. Backend: cd backend && npm run dev');
    console.log('2. Frontend: npm start');
  }
}

startSystem();