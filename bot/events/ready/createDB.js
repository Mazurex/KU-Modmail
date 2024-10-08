const Settings = require("../../models/settings");
const Modmail = require("../../models/modmail");
const Forum = require("../../models/forum");
const Stats = require("../../models/stats");

module.exports = async (client) => {
  let settings = await Settings.findOne();
  let modmail = await Modmail.findOne();
  let forum = await Forum.findOne();
  let stats = await Stats.findOne();

  if (!settings) {
    settings = new Settings({
      modmail_channel_id: 0,
      log_channel_id: 0,
      auto_log_channel_id: 0,
      modmail_cooldown_s: 3600,
      forum_cooldown_s: 3600,
      user_modmails: [],
      user_forums: [],
    });
    console.log("Created a new settings schema!");
  }

  if (!modmail) {
    modmail = new Modmail({
      index: 0,
      modmails: [],
    });
    console.log("Created a new modmail schema!");
  }

  if (!forum) {
    forum = new Forum({
      index: 0,
      forums: [],
    });
    console.log("Created a new forums schema!");
  }

  if (!stats) {
    stats = new Stats({});
    stats.total_commands = 0;
  }

  stats.last_startup = Date.now();
  stats.commands_executed_last_startup = 0;

  await settings.save();
  await modmail.save();
  await forum.save();
  await stats.save();
};
