
const fs = require('fs');
const path = require('path');

// Read the current package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = require(packageJsonPath);

// Add or update the dev script
if (!packageJson.scripts) {
  packageJson.scripts = {};
}

// Add the dev script to start Vite development server
packageJson.scripts.dev = "vite";

// Add other common scripts if they don't exist
if (!packageJson.scripts.build) {
  packageJson.scripts.build = "tsc && vite build";
}
if (!packageJson.scripts.lint) {
  packageJson.scripts.lint = "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0";
}
if (!packageJson.scripts.preview) {
  packageJson.scripts.preview = "vite preview";
}
if (!packageJson.scripts.start) {
  packageJson.scripts.start = "vite";
}

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Added "dev" script to package.json');
