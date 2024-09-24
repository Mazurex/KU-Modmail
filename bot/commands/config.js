const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
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
          { name: "Forum Channel ID", value: "forum_channel_id" },
          { name: "Helper Role ID", value: "helper_role_id" },
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
          "There was an issue with fetching the database, create a modmail/forum and try again!",
      });
    }

    if (type == "modmail_channel_id") {
      const channel = interaction.guild.channels.cache.get(value);
      if (!channel && !channel.isTextBased() && channel.isThread())
        return interaction.editReply({
          content: `\`${value}\` is not a valid channel!`,
        });
      settings.modmail_channel_id = value;
    } else if (type == "log_channel_id") {
      const channel = interaction.guild.channels.cache.get(value);
      if (!channel && !channel.isTextBased() && channel.isThread())
        return interaction.editReply({
          content: `\`${value}\` is not a valid channel!`,
        });
      settings.log_channel_id = value;
    } else if (type == "forum_channel_id") {
      const channel = interaction.guild.channels.cache.get(value);
      if (!channel && !channel.type == ChannelType.GuildForum)
        return interaction.editReply({
          content: `\`${value}\` is not a valid channel!`,
        });
      settings.forum_channel_id = value;
    } else if (type == "helper_role_id") {
      const role = interaction.guild.roles.cache.get(value);
      if (!role) {
        return interaction.editReply({
          content: `\`${value}\` is not a valid role!`,
        });
      }
      settings.helper_role_id = value;
    } else if (type == "cooldown") {
      if (value >= 0) {
        settings.cooldown_s = value;
      } else {
        return interaction.editReply({
          content: "The cooldown cannot be less than 0 seconds!",
        });
      }
    }
    interaction.editReply({
      content: `Successfully changed \`${type}\` to \`${value}\``,
    });

    await settings.save();
  },
};
