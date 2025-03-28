
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to update package.json
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
      return;
    }
    
    // Add or update scripts
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    // Add the required scripts
    packageJson.scripts.dev = "vite";
    packageJson.scripts.build = "tsc && vite build";
    packageJson.scripts.preview = "vite preview";
    packageJson.scripts.start = "vite";
    
    // Write the updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with dev script');
    console.log('You can now run any of these commands:');
    console.log('- npm run dev');
    console.log('- npm start');
    console.log('- npx vite');
  } catch (error) {
    console.error('❌ Error updating package.json:', error);
  }
}

// Execute the function
updatePackageJson();

// If this script was run directly, display additional help
if (require.main === module) {
  console.log('\n📋 Available scripts after update:');
  console.log('- npm run dev     (Start development server)');
  console.log('- npm start       (Start development server, alias)');
  console.log('- npm run build   (Build for production)');
  console.log('- npm run preview (Preview production build)');
}
