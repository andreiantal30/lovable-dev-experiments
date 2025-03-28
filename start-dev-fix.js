
#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('📦 Starting the development server...');

try {
  // Simple approach - just run Vite directly with the force flag to bypass WebSocket token checks
  console.log('🚀 Launching Vite dev server...');
  
  // Use execSync with stdio: 'inherit' to show output in real-time
  execSync('npx vite --force', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
} catch (error) {
  console.error('❌ Error running Vite:', error.message);
  console.log('\n👉 Try running one of these commands manually:');
  console.log('   npx vite --force');
  console.log('   npx vite --force --debug hmr');
  console.log('   node start.js');
  process.exit(1);
}
