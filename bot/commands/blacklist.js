const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const Settings = require("../models/settings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blacklist")
    .setDescription("Blacklist a user from the modmail system")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Who should be blacklisted?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Why are you blacklisting them")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction, client) {
    const target = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason");
    await interaction.deferReply({ ephemeral: true });

    const settings = await Settings.findOne();
    if (!settings) {
      return interaction.editReply({
        content:
          "There was an issue with fetching the database, create a modmail and try again!",
      });
    }

    const log_channel = interaction.guild.channels.cache.get(
      settings.log_channel_id
    );

    if (!log_channel) {
      return interaction.editReply({
        content:
          "There was an error with the modmail! Error code `2`, please send this to Mazurex!",
        ephemeral: true,
      });
    }

    const banned_user = settings.banned_users.find(
      (user) => user.user_id === target.id
    );

    if (banned_user) {
      return interaction.editReply({
        content: `${target} is already blacklisted!`,
      });
    }

    settings.banned_users.push({
      user_id: target.id,
      reason: reason,
      ban_timestamp: new Date(),
    });

    await settings.save();

    interaction.editReply({
      content: `Successfully blacklisted ${target} for \`${reason}\``,
    });

    const embed = new EmbedBuilder()
      .setTitle("ModMail Blacklist")
      .setFields(
        { name: "Moderator", value: `<@${interaction.user.id}>`, inline: true },
        { name: "Target", value: `<@${target.id}>`, inline: true },
        { name: "Reason", value: reason }
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
