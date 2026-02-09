const jwt = require("jsonwebtoken");
const Message = require("../models/Message");

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

    socket.on("disconnect", () => {
      console.log(`${socket.user.username} disconnected`);
    });
  });
}

module.exports = chatHandler;
