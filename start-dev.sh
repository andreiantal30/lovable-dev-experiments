
#!/bin/bash

# Update the package.json with the dev script
node update-scripts.js

# Start the development server using npm start (which will use the newly added script)
npm start
