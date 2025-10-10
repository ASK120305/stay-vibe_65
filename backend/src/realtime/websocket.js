import { WebSocketServer } from 'ws';
import url from 'url';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';

// Map of userId -> Set of WebSocket connections
const userIdToSockets = new Map();
// Map of bookingId (string) -> Set of WebSocket connections (dev fallback rooms)
const bookingIdToSockets = new Map();

function addConnection(userId, ws) {
  if (!userIdToSockets.has(userId)) {
    userIdToSockets.set(userId, new Set());
  }
  userIdToSockets.get(userId).add(ws);
}

function removeConnection(userId, ws) {
  const set = userIdToSockets.get(userId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) {
    userIdToSockets.delete(userId);
  }
}

export function setupWebSocketServer(server) {
  const wss = new WebSocketServer({ 
    server, 
    path: '/ws',
    perMessageDeflate: false, // Disable compression to avoid issues
    maxPayload: 1024 * 1024 // 1MB max payload
  });
  logger.info('WebSocket server initialized at path /ws');

  wss.on('connection', (ws, req) => {
    try {
      const { query } = url.parse(req.url, true);
      const token = query.token;
      if (!token) {
        logger.warn('WS connection rejected: missing token');
        ws.close(4401, 'Unauthorized');
        return;
      }

      let decoded;
      let userId;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id || decoded._id;
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          // Development fallback: treat token as userId
          userId = token;
          logger.info(`WS dev mode: accepting token as userId: ${userId}`);
        } else {
          logger.warn('WS connection rejected: invalid token');
          ws.close(4401, 'Unauthorized');
          return;
        }
      }
      if (!userId) {
        ws.close(4401, 'Unauthorized');
        return;
      }

      ws.userId = userId;
      addConnection(userId, ws);
      logger.info(`WS connected: user ${userId}, total connections: ${wss.clients.size}`);

      // Heartbeat
      ws.isAlive = true;
      ws.on('pong', () => { ws.isAlive = true; });

      ws.rooms = new Set();

      ws.on('message', async (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (!msg || typeof msg !== 'object') return;
          if (msg.type === 'JOIN_BOOKING' && msg.bookingId) {
            const key = String(msg.bookingId);
            ws.rooms.add(key);
            if (!bookingIdToSockets.has(key)) bookingIdToSockets.set(key, new Set());
            bookingIdToSockets.get(key).add(ws);
            return;
          }
          if (msg.type === 'LEAVE_BOOKING' && msg.bookingId) {
            const key = String(msg.bookingId);
            ws.rooms.delete(key);
            const set = bookingIdToSockets.get(key);
            if (set) {
              set.delete(ws);
              if (set.size === 0) bookingIdToSockets.delete(key);
            }
            return;
          }
          if (msg.type === 'SUPPORT_MESSAGE') {
            // Expect: { type, bookingId, content, timestamp }
            if (!msg.bookingId || !msg.content) return;
            // Load booking to find hotel manager
            let booking = null;
            if (mongoose.isValidObjectId(msg.bookingId)) {
              booking = await Booking.findById(msg.bookingId).select('user hotel');
            } else {
              booking = await Booking.findOne({ bookingReference: msg.bookingId }).select('user hotel');
            }

            if (booking) {
              // Authorize: sender must be booking guest or hotel manager
              const hotel = await Hotel.findById(booking.hotel).select('manager');
              const isGuest = booking.user.toString() === String(userId);
              const isManager = hotel && hotel.manager && hotel.manager.toString() === String(userId);
              if (!isGuest && !isManager) return;

              const recipientId = isGuest ? hotel.manager.toString() : booking.user.toString();
              const payload = {
                type: 'SUPPORT_MESSAGE',
                bookingId: mongoose.isValidObjectId(msg.bookingId) ? booking._id.toString() : msg.bookingId,
                sender: userId,
                content: msg.content,
                timestamp: msg.timestamp || Date.now(),
              };
              sendToUser(recipientId, payload);
            } else if (process.env.NODE_ENV !== 'production') {
              // Dev fallback: broadcast within booking room subscribers
              const key = String(msg.bookingId);
              const set = bookingIdToSockets.get(key);
              if (set) {
                const payload = {
                  type: 'SUPPORT_MESSAGE',
                  bookingId: key,
                  sender: userId,
                  content: msg.content,
                  timestamp: msg.timestamp || Date.now(),
                };
                set.forEach((client) => {
                  if (client !== ws && client.readyState === client.OPEN) {
                    client.send(JSON.stringify(payload));
                  }
                });
              }
            }
          }
        } catch (e) {
          logger.warn('WS received non-JSON/invalid message');
        }
      });

      ws.on('close', (code, reason) => {
        removeConnection(userId, ws);
        // cleanup room memberships
        if (ws.rooms) {
          ws.rooms.forEach((key) => {
            const set = bookingIdToSockets.get(key);
            if (set) {
              set.delete(ws);
              if (set.size === 0) bookingIdToSockets.delete(key);
            }
          });
        }
        logger.info(`WS disconnected: user ${userId}, code: ${code}, reason: ${reason}`);
      });

      ws.on('error', (err) => {
        logger.error('WS error:', err);
      });
    } catch (err) {
      logger.error('WS connection handler error:', err);
      try { ws.close(1011, 'Internal Error'); } catch {}
    }
  });

  // Ping interval to terminate dead connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(interval));

  return wss;
}

export function sendToUser(userId, payload) {
  const sockets = userIdToSockets.get(userId);
  if (!sockets || sockets.size === 0) return false;
  const message = JSON.stringify(payload);
  sockets.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  });
  return true;
}

export function emitBookingStatusUpdate(userId, bookingId, newStatus, message = '') {
  return sendToUser(userId, {
    type: 'BOOKING_STATUS_UPDATE',
    bookingId,
    newStatus,
    message,
  });
}

export function emitPriceAlert(userId, hotelId, roomId, newPrice, oldPrice) {
  return sendToUser(userId, {
    type: 'PRICE_ALERT',
    hotelId,
    roomId,
    newPrice,
    oldPrice,
  });
}


