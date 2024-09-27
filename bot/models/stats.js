const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({
  last_startup: { type: Date, default: Date.now() },
  commands_executed_last_startup: { type: Number, default: 0 },
  total_commands: { type: Number, default: 0 },
});

module.exports = mongoose.model("Stats", statsSchema);
