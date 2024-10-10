const { EmbedBuilder } = require("discord.js");
const Settings = require("../../models/settings");

module.exports = async (client, message) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) return console.log("Settings DB not found");

    const logChannel = message.guild.channels.cache.get(
      settings.auto_log_channel_id
    );

    if (logChannel && message.content && !message.author.bot) {
      const logEmbed = new EmbedBuilder()
        .setTitle(
          `Message sent by ${message.author.username} deleted in <#${message.channel.id}>`
        )
        .setDescription(`\`\`\`${message.content}\`\`\``)
        .setColor("Red")
        .setFooter({
          text: `Author ID: ${message.author.id} || Message ID: ${message.id}`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      await logChannel.send({ embeds: [logEmbed] });
    }
  } catch (error) {}
};
