const express = require("express");
const Conversation = require("../models/Conversation");
const DirectMessage = require("../models/DirectMessage");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET /api/dm/conversations
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.getByUserId(req.user.id);
    res.json(conversations);
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/dm/conversations
router.post("/conversations", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    if (userId === req.user.id) {
      return res.status(400).json({ error: "Cannot DM yourself" });
    }
    const conversation = await Conversation.findOrCreate(req.user.id, userId);
    res.status(201).json(conversation);
  } catch (err) {
    console.error("Create conversation error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/dm/messages/:conversationId
router.get("/messages/:conversationId", authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await DirectMessage.getByConversation(conversationId);
    res.json(messages);
  } catch (err) {
    console.error("Get DM messages error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
