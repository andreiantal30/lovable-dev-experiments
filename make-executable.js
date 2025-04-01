
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// List of scripts to make executable
const scriptsToMakeExecutable = [
  'start.js',
  'quickstart.js'
];

// Function to make a file executable
function makeExecutable(filePath) {
  try {
    fs.chmodSync(filePath, '755');
    console.log(`Made ${filePath} executable`);
  } catch (error) {
    console.error(`Could not make ${filePath} executable:`, error.message);
  }
}

// Loop through and make each script executable
scriptsToMakeExecutable.forEach(script => {
  const fullPath = path.join(__dirname, script);
  if (fs.existsSync(fullPath)) {
    makeExecutable(fullPath);
  } else {
    console.log(`File ${script} not found. Skipping.`);
  }
});

console.log('\nNow you can use one of these commands to start the server:');
console.log('- node start.js');
console.log('- node quickstart.js');
console.log('- npx vite');

