const {
  EmbedBuilder,
  ThreadAutoArchiveDuration,
  ChannelType,
} = require("discord.js");

const Modmail = require("../../models/modmail");
const Settings = require("../../models/settings");

module.exports = async (client, interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "modmail") {
    const title = interaction.fields.getTextInputValue("title");
    const content = interaction.fields.getTextInputValue("content");

    let modmailData = await Modmail.findOne();

    if (!modmailData) {
      modmailData = new Modmail({
        index: 1,
        modmails: [],
      });
    }

    const modmail_id = modmailData.index + 1;

    await modmailData.save();

    const modmailEmbed = new EmbedBuilder()
      .setTitle(`${interaction.user.username} | ${modmail_id}`)
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

    const settings = await Settings.findOne();

    const dmEmbed = new EmbedBuilder()
      .setTitle("ModMail Sent")
      .setDescription(
        `Your ModMail has been successfully sent!\nIf you need to followup, cancel, or modify your ModMail, DM a staff member with the ModMail ID below`
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

    modmailChannel = interaction.guild.channels.cache.get(
      settings.modmail_channel_id
    );

    const modmail_embed = await modmailChannel.send({ embeds: [modmailEmbed] });
    modmailEmbed.react("<:unresolved:1287504576651591730>");

    const thread = await modmail_embed.startThread({
      name: title,
      ThreadAutoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
      reason: "ModMail Sent",
    });

    thread.send({
      content: `\`\`\`${content}\`\`\``,
    });

    modmailData.modmails.push({
      modmail_id: modmail_id,
      sender_id: interaction.user.id,
      root_channel_id: interaction.channel.id,
      modmail_message_id: modmail_embed.id,
      timestamp: new Date(),
      resolved: false,
      thread_id: thread.id,
    });

    modmailData.index = modmail_id;
    await modmailData.save();

    await interaction.reply({
      content: "Your ModMail has been submitted!",
      ephemeral: true,
    });
  } else if (interaction.customId === "another modal") {
    // Future modal handling
  }
};
