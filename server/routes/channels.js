const express = require("express");
const Channel = require("../models/Channel");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET /api/channels — list all channels
router.get("/", authMiddleware, async (req, res) => {
  try {
    const channels = await Channel.getAll();
    res.json(channels);
  } catch (err) {
    console.error("Get channels error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
