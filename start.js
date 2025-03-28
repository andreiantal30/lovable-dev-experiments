
#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Creative Campaign Generator Startup Helper');
console.log('===========================================');

// First make sure package.json has the dev script
console.log('🔄 Checking package.json...');
require('./package-updater');

// Determine the best command to run
console.log('🚀 Starting development server...');
const command = 'npx vite';

console.log(`Running: ${command}`);
const child = exec(command);

child.stdout.on('data', (data) => {
  console.log(data.trim());
});

child.stderr.on('data', (data) => {
  console.error(data.trim());
});

child.on('error', (error) => {
  console.error('Error:', error.message);
  console.log('\n❓ Troubleshooting:');
  console.log('1. Make sure Vite is installed: npm install vite');
  console.log('2. Try running npx vite directly');
  console.log('3. Check if your package.json has a "dev" script');
});
