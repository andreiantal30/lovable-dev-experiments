
#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Creative Campaign Generator Startup Helper');
console.log('===========================================');

// First make sure package.json has the dev script
console.log('🔄 Checking and updating package.json...');

// Update package.json function
function updatePackageJson() {
  try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    
    // Read the package.json file
    let packageJson;
    try {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
      packageJson = JSON.parse(packageJsonContent);
    } catch (error) {
      console.error('Error reading package.json:', error);
      return false;
    }
    
    // Add or update scripts
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    // Add the required scripts
    let updated = false;
    
    if (!packageJson.scripts.dev) {
      packageJson.scripts.dev = "vite --force";
      updated = true;
    }
    if (!packageJson.scripts.build) {
      packageJson.scripts.build = "tsc && vite build";
      updated = true;
    }
    if (!packageJson.scripts.preview) {
      packageJson.scripts.preview = "vite preview";
      updated = true;
    }
    if (!packageJson.scripts.start) {
      packageJson.scripts.start = "vite --force";
      updated = true;
    }
    
    // Write the updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    if (updated) {
      console.log('✅ Updated package.json with missing scripts');
    } else {
      console.log('✅ Package.json already has all required scripts');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error updating package.json:', error);
    return false;
  }
}

// Execute the updatePackageJson function
updatePackageJson();

// Determine the best command to run
console.log('🚀 Starting development server...');
const command = 'npx vite --force';

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
  console.log('2. Try running npx vite --force directly');
  console.log('3. Make sure all dependencies are installed: npm install');
});
