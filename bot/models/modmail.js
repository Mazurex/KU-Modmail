const mongoose = require("mongoose");

const modmailSchema = new mongoose.Schema({
  index: { type: Number, default: 0 },
  modmails: [
    {
      modmail_id: { type: Number, unique: true, required: true },
      sender_id: { type: String, required: true },
      root_channel_id: { type: String, required: true },
      modmail_message_id: { type: String, required: true },
      timestamp: { type: Date, default: Date.now(), required: true },
    },
  ],
});

module.exports = mongoose.model("Modmail", modmailSchema);
