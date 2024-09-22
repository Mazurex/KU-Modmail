const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const config = require("../config/channels.json");
const Settings = require("../models/settings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modmail")
    .setDescription(
      "Send modmail for staff members to see (opens a modal menu)"
    ),

  async execute(interaction, client) {
    const currentTime = new Date();

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({
        modmail_channel_id: 0,
        cooldown_s: 3600,
        user_modmails: [],
      });
    }

    const bannedUser = settings.banned_users.find(
      (user) => user.user_id === interaction.user.id
    );

    if (bannedUser) {
      return interaction.reply({
        content: `You are banned from using ModMail. Reason: \`${bannedUser.reason}\``,
      });
    }

    const userModmail = settings.user_modmails.find(
      (user) => user.user_id === interaction.user.id
    );

    if (userModmail) {
      const lastTimeStamp = userModmail.last_modmail_timestamp;
      const cooldown = settings.cooldown_s * 1000;
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

    if (!interaction.guild.channels.fetch(config.modmail_channel)) {
      return interaction.reply({
        content:
          "There was an error with the modmail! Error code `1`, please send this to a moderator!",
        ephemeral: true,
      });
    }

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
  },
};
