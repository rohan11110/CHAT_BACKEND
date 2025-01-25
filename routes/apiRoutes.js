const express = require("express");
const router = express.Router();
const Message = require("../models/massageModel");

// Endpoint to fetch messages for a room
router.get("/messages/:room", async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});

module.exports = router;
