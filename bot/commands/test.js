const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Stats = require("../models/stats");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Testing command to show some basic bot stats")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction, client) {
    const deferred = await interaction.deferReply({ fetchReply: true });
    const stats = await Stats.findOne();
    if (!stats) {
      console.log("Stats database not found!");
      interaction.editReply({ content: "Stats database not found!" });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("General Bot Information")
      .setDescription("Below is the general information of the bot")
      .setFields(
        {
          name: "Ping",
          value: `${
            deferred.createdTimestamp - interaction.createdTimestamp
          }Ms`,
          inline: true,
        },
        {
          name: "Commands since last startup",
          value: `${stats.commands_executed_last_startup}`,
          inline: true,
        },
        {
          name: "Total commands executed",
          value: `${stats.total_commands}`,
          inline: true,
        },
        {
          name: "Last Startup",
          value: stats.last_startup.toString(),
        }
      )
      .setFooter({
        text: "KUtilities",
        iconURL: client.user.displayAvatarURL(),
      })
      .setColor("Blurple")
      .setTimestamp();

    interaction.editReply({ embeds: [embed] });
  },
};
