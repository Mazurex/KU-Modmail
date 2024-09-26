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
  if (interaction.customId == "modmail_button") {
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

    const modmailChannel = interaction.guild.channels.cache.get(
      settings.modmail_channel_id
    );

    const loggingChannel = interaction.guild.channels.cache.get(
      settings.log_channel_id
    );

    if (!modmailChannel) {
      return interaction.reply({
        content:
          "There was an error with the modmail! Error code `1`, please send this to a moderator!",
        ephemeral: true,
      });
    }

    if (!loggingChannel) {
      return interaction.reply({
        content:
          "There was an error with the modmail! Error code `2`, please send this to a moderator!",
        ephemeral: true,
      });
    }

    const userModmail = settings.user_modmails.find(
      (user) => user.user_id === interaction.user.id
    );

    if (userModmail) {
      const lastTimeStamp = userModmail.last_modmail_timestamp;
      const cooldown = settings.modmail_cooldown_s * 1000;
      const timeSinceLastModmail = currentTime - lastTimeStamp;

      if (timeSinceLastModmail < cooldown) {
        const cooldownEndTimestamp = Math.floor(
          (currentTime.getTime() + (cooldown - timeSinceLastModmail)) / 1000
        );
        return interaction.reply({
          content: `You can send a ModMail again <t:${cooldownEndTimestamp}:R>`,
          ephemeral: true,
        });
      }
    }

    if (userModmail) {
      userModmail.last_modmail_timestamp = currentTime;
    } else {
      settings.user_modmails.push({
        user_id: interaction.user.id,
        last_modmail_timestamp: currentTime,
      });
    }

    await settings.save();

    const modal = new ModalBuilder()
      .setCustomId("modmail")
      .setTitle("KasaiSora Universe ModMail");

    const title = new TextInputBuilder()
      .setCustomId("title")
      .setLabel("Modmail Title")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(25)
      .setRequired(true);
    const description = new TextInputBuilder()
      .setCustomId("content")
      .setLabel("ModMail Contents")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(256)
      .setRequired(true);

    const titleActionRow = new ActionRowBuilder().addComponents(title);
    const descriptionActionRow = new ActionRowBuilder().addComponents(
      description
    );

    modal.addComponents(titleActionRow, descriptionActionRow);

    await interaction.showModal(modal);
  }
};
