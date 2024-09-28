const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Settings = require("../models/settings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reset_cooldown")
    .setDescription("Reset the modmail cooldown of a specific user")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Who's cooldown should be reset")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction, client) {
    const target = interaction.options.getUser("target");
    await interaction.deferReply({ ephemeral: true });

    const settings = await Settings.findOne();
    if (!settings) {
      return interaction.editReply({
        content:
          "There was an issue with fetching the database, create a modmail/forum and try again!",
      });
    }

    const log_channel = interaction.guild.channels.cache.get(
      settings.log_channel_id
    );

    if (!log_channel) {
      return interaction.editReply({
        content:
          "There was an error with the modmail/forum! Error code `2`, please send this to Mazurex!",
        ephemeral: true,
      });
    }

    const cooldown = settings.user_modmails.find(
      (user) => user.user_id === target.id
    );

    const forum = settings.user_forums.find(
      (user) => user.user_id === target.id
    );

    if (!cooldown && !forum) {
      interaction.editReply({
        content: `${target} has not yet created a modmail/forum!`,
        ephemeral: true,
      });
    }

    const currentDate = new Date();
    let pastDate = new Date();
    pastDate.setDate(currentDate.getDate() - 7);

    if (cooldown) {
      cooldown.last_modmail_timestamp = pastDate;
    }
    if (forum) {
      forum.last_forum_timestamp = pastDate;
    }

    await settings.save();

    interaction.editReply({
      content: `Successfully reset cooldowns for ${target}`,
    });

    const embed = new EmbedBuilder()
      .setTitle("ModMail and Forum Cooldown Reset")
      .setFields(
        { name: "Moderator", value: `<@${interaction.user.id}>`, inline: true },
        { name: "Target", value: `<@${target.id}>`, inline: true }
      )
      .setFooter({
        text: "KasaiSora Universe ModMail",
        iconURL: client.user.displayAvatarURL(),
      })
      .setColor("Blurple")
      .setTimestamp();

    log_channel.send({ embeds: [embed] });
  },
};
