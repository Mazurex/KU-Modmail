const mongoose = require("mongoose");

const modmailSchema = new mongoose.Schema({
  index: { type: Number, default: 0 },
  modmails: [
    {
      modmail_id: { type: Number, unique: true },
      sender_id: { type: String },
      root_channel_id: { type: String },
      modmail_message_id: { type: String },
      timestamp: { type: Date, default: Date.now() },
      resolved: { type: Boolean, default: false },
      thread_id: { type: String },
    },
  ],
});

module.exports = mongoose.model("Modmail", modmailSchema);
