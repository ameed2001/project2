#!/usr/bin/env node

/**
 * Server startup script with better error handling
 */

const http = require('http');
const net = require('net');

const PORT = process.env.PORT || 3001;

// Check if port is available
function checkPort(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} is already in use. Please stop the existing server or use a different port.`));
      } else {
        reject(err);
      }
    });
  });
}

// Start the server
async function startServer() {
  try {
    // Check if port is available
    await checkPort(PORT);
    console.log(`✅ Port ${PORT} is available`);
    
    // Load and start the server
    console.log('🚀 Starting server...');
    require('./server.js');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    if (error.message.includes('EADDRINUSE')) {
      console.error('\n💡 To fix this:');
      console.error(`   1. Find the process using port ${PORT}:`);
      console.error(`      netstat -ano | findstr :${PORT}`);
      console.error(`   2. Kill the process or restart your computer`);
      console.error(`   3. Or set a different port: PORT=3002 npm start`);
    }
    process.exit(1);
  }
}

startServer();

