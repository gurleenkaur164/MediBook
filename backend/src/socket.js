const { Server } = require('socket.io');
const { verifyAccessToken } = require('./utils/jwt');

let io = null;

/**
 * Initialise Socket.IO on top of the given HTTP server.
 * Clients authenticate by passing their JWT access token in the
 * handshake auth payload: io(url, { auth: { token } }).
 * Each authenticated socket joins a private room `user:<id>` so the
 * server can push notifications to a specific user in real time.
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Auth middleware — reject sockets without a valid token
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('No token provided'));
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    socket.emit('connected', { ok: true });

    socket.on('disconnect', () => {
      // room membership is cleaned up automatically
    });
  });

  console.log('🔌 Socket.IO initialised');
  return io;
};

/** Emit an event to a single user's room. Safe no-op if io not ready. */
const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
};

const getIO = () => io;

module.exports = { initSocket, emitToUser, getIO };
