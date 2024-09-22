const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Settings = require("../models/settings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure features of the bot")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("What are you customizing")
        .setRequired(true)
        .addChoices(
          { name: "Modmail Channel ID", value: "modmail_channel_id" },
          { name: "Logging Channel ID", value: "log_channel_id" },
          { name: "Cooldown in Sec", value: "cooldown" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("value")
        .setDescription("The value of the option")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client) {
    const type = interaction.options.getString("type");
    const value = interaction.options.getString("value");
    await interaction.deferReply({ ephemeral: true });

    let settings = await Settings.findOne();
    if (!settings) {
      return interaction.editReply({
        content:
          "There was an issue with fetching the database, create a modmail and try again!",
      });
    }

    if (type == "modmail_channel_id") {
      const channel = interaction.guild.channels.cache.get(value);
      if (!channel)
        return interaction.editReply({
          content: `\`${value}\` doesn't exist!`,
        });
      settings.modmail_channel_id = value;
    } else if (type == "log_channel_id") {
      const channel = interaction.guild.channels.cache.get(value);
      if (!channel)
        return interaction.editReply({
          content: `\`${value}\` doesn't exist!`,
        });
      settings.log_channel_id = value;
    } else if (type == "cooldown") {
      settings.cooldown_s = value;
    }
    interaction.editReply({
      content: `Successfully changed \`${type}\` to \`${value}\``,
    });
    await settings.save();
  },
};
