#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Quick Start: Creative Campaign Generator');
console.log('=========================================');

// Always run npx vite directly without any package.json dependency
try {
  console.log('Starting Vite development server...');
  console.log('(Press Ctrl+C to stop the server)\n');
  
  // Run Vite directly using execSync to keep the process running
  execSync('npx vite', { stdio: 'inherit' });
} catch (error) {
  // This will be reached when the user terminates the process with Ctrl+C
  console.log('\nServer stopped.');
}
