const {
  EmbedBuilder,
  ThreadAutoArchiveDuration,
  ChannelType,
} = require("discord.js");
const config = require("../../config/channels.json");

const Modmail = require("../../models/modmail");

module.exports = async (client, interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "modmail") {
    const title = interaction.fields.getTextInputValue("title");
    const content = interaction.fields.getTextInputValue("content");

    const lastModmail = await Modmail.findOne().sort({ index: -1 });
    const modmail_id = lastModmail ? lastModmail.index + 1 : 1;

    const modmailData = new Modmail({
      index: modmail_id,
      modmails: {
        modmail_id: modmail_id,
        sender_id: interaction.user.id,
        root_channel_id: interaction.channel.id,
        modmail_message_id: "",
        timestamp: new Date(),
      },
    });

    await modmailData.save();

    const dmEmbed = new EmbedBuilder()
      .setTitle("ModMail Sent")
      .setDescription(
        `Your ModMail has been successfully sent, you may send another one in <timestamp>\nIf you need to followup, cancel, or modify your ModMail, DM a staff member with the ModMail ID below`
      )
      .addFields(
        { name: "ModMail ID", value: `${modmail_id}`, inline: true },
        { name: "Your ID", value: interaction.user.id, inline: true }
      )
      .setFooter({
        text: "KasaiSora Universe ModMail",
        iconURL: client.user.displayAvatarURL(),
      })
      .setColor("Blurple")
      .setTimestamp();

    const member = interaction.guild.members.cache.get(interaction.user.id);

    try {
      member.send({ embeds: [dmEmbed] });
    } catch (error) {}

    const modmailEmbed = new EmbedBuilder()
      .setTitle(`${interaction.user.username} | modmail_id`)
      .addFields(
        { name: "Sender ID", value: interaction.user.id, inline: true },
        { name: "ModMail ID", value: `${modmail_id}`, inline: true },
        { name: "Root Channel", value: `<#${interaction.channel.id}>` }
      )
      .setFooter({
        text: "KasaiSora Universe ModMail",
        iconURL: client.user.displayAvatarURL(),
      })
      .setColor("Blurple")
      .setTimestamp();

    const modmailChannel = interaction.guild.channels.cache.get(
      config.modmail_channel
    );
    const modmail_embed = await modmailChannel.send({ embeds: [modmailEmbed] });

    const thread = await modmail_embed.startThread({
      name: title,
      ThreadAutoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
      reason: "ModMail Sent",
    });

    thread.send({
      content: `\`\`\`${content}\`\`\``,
    });
  } else if (interaction.customId === "another modal") {
    // Future modal handling
  }
};
