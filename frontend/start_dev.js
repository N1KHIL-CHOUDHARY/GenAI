#!/usr/bin/env node
/**
 * Frontend development server startup script
 * This script starts the Vite development server with proper configuration
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Legal Document Assistant Frontend...');
console.log('📍 Frontend will be available at: http://localhost:5173');
console.log('🔗 Make sure the backend is running on: http://localhost:8000');
console.log('-'.repeat(50));

// Start Vite development server
const viteProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname),
    stdio: 'inherit',
    shell: true
});

viteProcess.on('error', (error) => {
    console.error('❌ Error starting frontend server:', error);
    process.exit(1);
});

viteProcess.on('close', (code) => {
    console.log(`\n🛑 Frontend server stopped with code ${code}`);
    process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down frontend server...');
    viteProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down frontend server...');
    viteProcess.kill('SIGTERM');
});
