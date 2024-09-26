const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  modmail_channel_id: { type: String },
  forum_channel_id: { type: String },
  log_channel_id: { type: String },
  helper_role_id: { type: String },
  modmail_cooldown_s: { type: Number, default: 3600 },
  forum_cooldown_s: { type: Number, default: 3600 },
  user_modmails: [
    {
      user_id: { type: String },
      last_modmail_timestamp: {
        type: Date,
        timestamp: Date.now(),
      },
    },
  ],
  user_forums: [
    {
      user_id: { type: String },
      last_forum_timestamp: {
        type: Date,
        timestamp: Date.now(),
      },
    },
  ],
  banned_users: [
    {
      user_id: { type: String },
      ban_timestamp: { type: Date, default: Date.now() },
      reason: { type: String },
    },
  ],
});

module.exports = mongoose.model("Settings", settingsSchema);
