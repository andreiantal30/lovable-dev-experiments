
const fs = require('fs');
const path = require('path');

try {
  fs.chmodSync(path.join(__dirname, 'start-dev.sh'), '755');
  console.log('Made start-dev.sh executable');
} catch (error) {
  console.error('Could not make script executable:', error.message);
}
