const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Settings = require("../models/settings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modmail_unban")
    .setDescription("Unban a banned member from modmail")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Who should be modmail banned?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Why are you modmail banning them")
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

    if (!banned_user) {
      return interaction.editReply({ content: `${target} is not banned!` });
    }

    banned_user.deleteOne();

    interaction.editReply({
      content: `Successfully unbanned ${target} for \`${reason}\``,
    });

    await settings.save();

    const embed = new EmbedBuilder()
      .setTitle("ModMail Unban")
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
