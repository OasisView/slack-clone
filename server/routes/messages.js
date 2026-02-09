const express = require("express");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET /api/messages/:channelId — get message history for a channel
router.get("/:channelId", authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const messages = await Message.getByChannel(channelId);
    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
