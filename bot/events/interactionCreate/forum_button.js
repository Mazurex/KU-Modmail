const {
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const Settings = require("../../models/settings");
const Forum = require("../../models/forum");

module.exports = async (client, interaction) => {
  if (interaction.customId == "forum_button") {
    const currentTime = new Date();

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({
        modmail_channel_id: 0,
        log_channel_id: 0,
        modmail_cooldown_s: 3600,
        forum_cooldown_s: 3600,
        user_modmails: [],
        user_forums: [],
      });
    }

    await settings.save();

    const bannedUser = settings.banned_users.find(
      (user) => user.user_id === interaction.user.id
    );

    if (bannedUser) {
      return interaction.reply({
        content: `You are banned from using the bot. Reason: \`${bannedUser.reason}\``,
      });
    }

    const forumChannel = interaction.guild.channels.cache.get(
      settings.forum_channel_id
    );

    const loggingChannel = interaction.guild.channels.cache.get(
      settings.log_channel_id
    );

    if (!forumChannel) {
      return interaction.reply({
        content:
          "There was an error with the forum! Error code `1`, please send this to a moderator!",
        ephemeral: true,
      });
    }

    if (!loggingChannel) {
      return interaction.reply({
        content:
          "There was an error with the forum! Error code `2`, please send this to a moderator!",
        ephemeral: true,
      });
    }

    const userForum = settings.user_forums.find(
      (user) => user.user_id == interaction.user.id
    );

    if (userForum) {
      const lastTimeStamp = userForum.last_forum_timestamp;
      const cooldown = settings.forum_cooldown_s * 1000;
      const timeSinceLastForum = currentTime - lastTimeStamp;

      if (timeSinceLastForum < cooldown) {
        const cooldownEndTimestamp = Math.floor(
          (currentTime.getTime() + (cooldown - timeSinceLastForum)) / 1000
        );
        return interaction.reply({
          content: `You can send a ModMail again <t:${cooldownEndTimestamp}:R>`,
          ephemeral: true,
        });
      }
    } else {
      return interaction.reply({
        content: "There was an issue with the database!",
        ephemeral: true,
      });
    }

    if (userForum) {
      userForum.last_forum_timestamp = currentTime;
    } else {
      settings.user_forums.push({
        user_id: interaction.user.id,
        last_forum_timestamp: currentTime,
      });
    }

    await settings.save();

    const modal = new ModalBuilder()
      .setCustomId("forum")
      .setTitle("KasaiSora Universe Community");

    const title = new TextInputBuilder()
      .setCustomId("title")
      .setLabel("A BRIEF OVERVIEW OF YOUR PROBLEM")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(64)
      .setRequired(true);
    const version = new TextInputBuilder()
      .setCustomId("version")
      .setLabel("PROVIDE THE OUTPUT OF RUNNING /VERSION")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(69)
      .setRequired(true);
    const logs = new TextInputBuilder()
      .setCustomId("logs")
      .setLabel("PLEASE SHARE YOUR MCLO.GS LOG FILE")
      .setPlaceholder("https://mclo.gs/S1gMa")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(69)
      .setRequired(false);
    const spark = new TextInputBuilder()
      .setCustomId("spark")
      .setLabel("PLEASE SHARE YOUR SPARK PROFILER REPORT")
      .setPlaceholder("https://spark.lucko.me/SUsSy0BaKA")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(69)
      .setRequired(false);
    const description = new TextInputBuilder()
      .setCustomId("description")
      .setLabel("A DETAILED DESCRIPTION OF YOUR PROBLEM")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(2100)
      .setRequired(true);

    const titleActionRow = new ActionRowBuilder().addComponents(title);
    const versionActionRow = new ActionRowBuilder().addComponents(version);
    const logsActionRow = new ActionRowBuilder().addComponents(logs);
    const sparkActionRow = new ActionRowBuilder().addComponents(spark);
    const descriptionActionRow = new ActionRowBuilder().addComponents(
      description
    );

    modal.addComponents(
      titleActionRow,
      versionActionRow,
      logsActionRow,
      sparkActionRow,
      descriptionActionRow
    );
    await interaction.showModal(modal);
  }
};
