const mongoose = require("mongoose");

const forumSchema = new mongoose.Schema({
  index: { type: Number, default: 0 },
  forums: [
    {
      forum_id: { type: Number, unique: true },
      sender_id: { type: String },
      root_channel_id: { type: String },
      timestamp: { type: Date, default: Date.now() },
      resolved: { type: Boolean, default: false },
      post_id: { type: String },
    },
  ],
});

module.exports = mongoose.model("Forum", forumSchema);
