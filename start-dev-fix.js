
#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('📦 Starting the development server...');

try {
  // Run Vite with the force flag and disable hmr verification
  console.log('🚀 Launching Vite dev server with WebSocket fixes...');
  
  // Use execSync with stdio: 'inherit' to show output in real-time
  execSync('npx vite --force --debug hmr', { 
    stdio: 'inherit',
    cwd: process.cwd(),
    env: {
      ...process.env,
      // Disable WebSocket token validation
      VITE_DISABLE_WS_TOKEN: 'true',
      // Define the WS token directly in the environment
      __WS_TOKEN__: 'development-token',
      // Enable more detailed HMR logging
      DEBUG: 'vite:hmr'
    }
  });
} catch (error) {
  console.error('❌ Error running Vite:', error.message);
  console.log('\n👉 Try running one of these commands manually:');
  console.log('   npx vite --force');
  console.log('   npx vite --force --debug hmr');
  console.log('   node start.js');
  process.exit(1);
}
