const { EmbedBuilder } = require("discord.js");
const Settings = require("../../models/settings");

module.exports = async (client, oldMember, newMember) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) return console.log("Settings DB not found");

    const logChannel = newMember.guild.channels.cache.get(
      settings.auto_log_channel_id
    );

    if (!logChannel || newMember.user.bot) return;

    if (oldMember.displayName !== newMember.displayName) {
      const logEmbed = new EmbedBuilder()
        .setTitle(`${newMember.user.username} has changed their nickname`)
        .setColor("Blurple")
        .setFooter({
          text: `User ID: ${newMember.id}`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp()
        .setDescription(
          `Before:\`\`\`${oldMember.displayName}\`\`\`\nAfter:\`\`\`${newMember.displayName}\`\`\``
        );

      await logChannel.send({ embeds: [logEmbed] });
    }
  } catch (error) {
    console.error(error);
  }
};
