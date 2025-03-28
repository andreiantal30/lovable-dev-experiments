
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to update package.json
function updatePackageJson() {
  try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add or update scripts
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts.dev = "vite";
    packageJson.scripts.build = "tsc && vite build";
    packageJson.scripts.preview = "vite preview";
    packageJson.scripts.start = "vite";
    
    // Write the updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json with dev script');
    
    // Run npm start as fallback
    console.log('Starting development server...');
    exec('npm start', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
    
  } catch (error) {
    console.error('Error updating package.json:', error);
  }
}

updatePackageJson();
