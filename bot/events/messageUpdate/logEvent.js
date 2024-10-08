const { EmbedBuilder } = require("discord.js");
const Settings = require("../../models/settings");

module.exports = async (client, oldMessage, newMessage) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) return console.log("Settings DB not found");

    const logChannel = newMember.guild.channels.cache.get(
      settings.auto_log_channel_id
    );

    if (logChannel && !newMessage.author.bot) {
      const logEmbed = new EmbedBuilder()
        .setTitle(
          `Message sent by ${newMessage.author.username} edited in ${newMessage.url}`
        )
        .setColor("Blurple")
        .setFooter({
          text: `Author ID: ${newMessage.author.id} || Message ID: ${newMessage.id}`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      if (!oldMessage.partial) {
        logEmbed.setDescription(
          `Before:\`\`\`${oldMessage.content}\`\`\`\nAfter:\`\`\`${newMessage.content}\`\`\``
        );

        await logChannel.send({ embeds: [logEmbed] });
      } else {
        const fetchedMessage = await newMessage.channel.messages.fetch(
          oldMessage.id
        );

        logEmbed.setDescription(
          `Before:\`\`\`${fetchedMessage.content}\`\`\`\nAfter:\`\`\`${newMessage.content}\`\`\``
        );

        await logChannel.send({ embeds: [logEmbed] });
      }
    }
  } catch (error) {
    console.error(error);
  }
};
