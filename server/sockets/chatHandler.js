const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const DirectMessage = require("../models/DirectMessage");
const Conversation = require("../models/Conversation");

// Track online users: Map<socketId, { userId, username }>
const onlineUsers = new Map();

function chatHandler(io) {
  // Authenticate socket connections via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`${socket.user.username} connected`);

    // Track this user as online
    onlineUsers.set(socket.id, {
      userId: socket.user.id,
      username: socket.user.username,
    });

    // Broadcast updated online list to everyone
    io.emit("onlineUsers", getUniqueOnlineUsers());

    // Join a channel room
    socket.on("joinChannel", ({ channelId }) => {
      // Leave all other channel rooms first
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });

      socket.join(`channel-${channelId}`);
      console.log(`${socket.user.username} joined channel ${channelId}`);
    });

    // Send a message
    socket.on("sendMessage", async ({ channelId, content }) => {
      if (!content || !content.trim()) return;

      try {
        // Save to database
        const saved = await Message.create(content.trim(), socket.user.id, channelId);

        // Broadcast to everyone in the channel
        io.to(`channel-${channelId}`).emit("newMessage", {
          id: saved.id,
          content: saved.content,
          username: socket.user.username,
          channel_id: channelId,
          created_at: saved.created_at,
        });
      } catch (err) {
        console.error("Send message error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicator — start
    socket.on("typing", ({ channelId }) => {
      socket.to(`channel-${channelId}`).emit("userTyping", {
        username: socket.user.username,
        channelId,
      });
    });

    // Typing indicator — stop
    socket.on("stopTyping", ({ channelId }) => {
      socket.to(`channel-${channelId}`).emit("userStopTyping", {
        username: socket.user.username,
        channelId,
      });
    });

    // --- DM Events ---

    // Join a DM room
    socket.on("joinDM", ({ recipientId }) => {
      const roomName = `dm-${Math.min(socket.user.id, recipientId)}-${Math.max(socket.user.id, recipientId)}`;

      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });

      socket.join(roomName);
      console.log(`${socket.user.username} joined DM room ${roomName}`);
    });

    // Send a DM
    socket.on("sendDM", async ({ recipientId, conversationId, content }) => {
      if (!content || !content.trim()) return;

      try {
        const saved = await DirectMessage.create(content.trim(), socket.user.id, conversationId);
        const roomName = `dm-${Math.min(socket.user.id, recipientId)}-${Math.max(socket.user.id, recipientId)}`;

        io.to(roomName).emit("newDM", {
          id: saved.id,
          content: saved.content,
          username: socket.user.username,
          conversation_id: conversationId,
          created_at: saved.created_at,
        });
      } catch (err) {
        console.error("Send DM error:", err);
        socket.emit("error", { message: "Failed to send DM" });
      }
    });

    // DM typing indicators
    socket.on("dmTyping", ({ recipientId }) => {
      const roomName = `dm-${Math.min(socket.user.id, recipientId)}-${Math.max(socket.user.id, recipientId)}`;
      socket.to(roomName).emit("dmUserTyping", {
        username: socket.user.username,
      });
    });

    socket.on("dmStopTyping", ({ recipientId }) => {
      const roomName = `dm-${Math.min(socket.user.id, recipientId)}-${Math.max(socket.user.id, recipientId)}`;
      socket.to(roomName).emit("dmUserStopTyping", {
        username: socket.user.username,
      });
    });

    socket.on("disconnect", () => {
      console.log(`${socket.user.username} disconnected`);

      // Remove from online users
      onlineUsers.delete(socket.id);

      // Broadcast updated online list
      io.emit("onlineUsers", getUniqueOnlineUsers());
    });
  });
}

// Deduplicate users with multiple tabs/connections
function getUniqueOnlineUsers() {
  const seen = new Set();
  const users = [];
  for (const { userId, username } of onlineUsers.values()) {
    if (!seen.has(userId)) {
      seen.add(userId);
      users.push({ userId, username });
    }
  }
  return users;
}

module.exports = chatHandler;
