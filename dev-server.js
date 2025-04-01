
#!/usr/bin/env node

console.log('Starting Vite development server...');

// Import and run Vite programmatically
require('vite').createServer().then(server => {
  server.listen();
  console.log('Vite server started successfully!');
}).catch(err => {
  console.error('Failed to start Vite server:', err);
});
