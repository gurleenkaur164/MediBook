require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/socket');

const PORT = process.env.PORT || 5000;

// Wrap the Express app in a raw HTTP server so Socket.IO can share the port
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});
