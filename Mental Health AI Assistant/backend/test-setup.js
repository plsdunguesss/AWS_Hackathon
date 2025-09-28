// Simple test script to verify the backend setup
const http = require('http');

console.log('Testing Mental Health AI Assistant Backend Setup...\n');

// Test if we can start the server and connect to it
const { spawn } = require('child_process');

// Start the server
console.log('1. Starting the server...');
const server = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'pipe'
});

let serverReady = false;

server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('Server output:', output);
    
    if (output.includes('Mental Health AI Assistant backend server running')) {
        serverReady = true;
        console.log('✅ Server started successfully!\n');
        
        // Test health endpoint
        setTimeout(() => {
            console.log('2. Testing health endpoint...');
            
            const req = http.request({
                hostname: 'localhost',
                port: 5000,
                path: '/api/health',
                method: 'GET'
            }, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        console.log('✅ Health check response:', response);
                        
                        if (response.status === 'healthy') {
                            console.log('✅ Backend setup is working correctly!');
                        } else {
                            console.log('⚠️ Backend is running but some services may be unavailable');
                        }
                    } catch (error) {
                        console.log('❌ Invalid response from health endpoint');
                    }
                    
                    // Clean up
                    server.kill();
                    process.exit(0);
                });
            });
            
            req.on('error', (error) => {
                console.log('❌ Failed to connect to server:', error.message);
                server.kill();
                process.exit(1);
            });
            
            req.end();
        }, 2000);
    }
});

server.stderr.on('data', (data) => {
    console.log('Server error:', data.toString());
});

server.on('close', (code) => {
    if (!serverReady) {
        console.log('❌ Server failed to start');
        process.exit(1);
    }
});

// Timeout after 30 seconds
setTimeout(() => {
    if (!serverReady) {
        console.log('❌ Server startup timeout');
        server.kill();
        process.exit(1);
    }
}, 30000);