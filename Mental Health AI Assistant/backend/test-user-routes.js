// Simple test to verify user routes compilation
const express = require('express');

// Test if the TypeScript files compile correctly
async function testCompilation() {
  try {
    console.log('Testing user service compilation...');
    
    // This will fail if there are TypeScript compilation errors
    const { UserService } = require('./dist/services/userService');
    console.log('✓ UserService compiled successfully');
    
    const { userRoutes } = require('./dist/routes/user');
    console.log('✓ User routes compiled successfully');
    
    console.log('✓ All user management components compiled successfully');
    
    // Test basic route structure
    const app = express();
    app.use('/api/user', userRoutes);
    console.log('✓ Routes registered successfully');
    
    return true;
  } catch (error) {
    console.error('✗ Compilation error:', error.message);
    return false;
  }
}

testCompilation().then(success => {
  process.exit(success ? 0 : 1);
});