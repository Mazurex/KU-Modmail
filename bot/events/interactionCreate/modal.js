const {
  EmbedBuilder,
  ThreadAutoArchiveDuration,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

const Modmail = require("../../models/modmail");
const Forum = require("../../models/forum");
const Settings = require("../../models/settings");

module.exports = async (client, interaction) => {
  if (!interaction.isModalSubmit()) return;

  const currentTime = new Date();

  if (interaction.customId === "modmail") {
    await interaction.deferReply({ ephemeral: true });
    const title = interaction.fields.getTextInputValue("title");
    const content = interaction.fields.getTextInputValue("content");

    let modmailData = await Modmail.findOne();

    if (!modmailData) {
      modmailData = new Modmail({
        index: 0,
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

    let settings = await Settings.findOne();

    const userModmail = settings.user_modmails.find(
      (user) => user.user_id === interaction.user.id
    );

    if (userModmail) {
      userModmail.last_modmail_timestamp = currentTime; // Update timestamp
    } else {
      settings.user_modmails.push({
        user_id: interaction.user.id,
        last_modmail_timestamp: currentTime, // Set new timestamp
      });
    }

    await settings.save();

    const dmEmbed = new EmbedBuilder()
      .setTitle("ModMail Sent")
      .setDescription(
        `Your ModMail has been successfully sent!\nIf you need to followup, cancel, or modify your ModMail, DM a staff member with the ModMail ID below.\nBelow there will also be another message with your ModMail contents!\nIf you need to add to your ModMail, or reply to a Moderator, use the \`/respond\` command!`
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
      await member.send({
        embeds: [dmEmbed],
        content: `\`ModMail contents:\`\n\n\`\`\`${title}\`\`\`\n\`\`\`${content}\`\`\``,
      });
    } catch (error) {}

    modmailChannel = interaction.guild.channels.cache.get(
      settings.modmail_channel_id
    );

    const modmail_embed = await modmailChannel.send({ embeds: [modmailEmbed] });
    modmail_embed.react("<:unresolved:1287504576651591730>");

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

    await interaction.editReply({
      content: `Your ModMail has been submitted! You should have recieved a DM from the bot containing the information of your ModMail, if not, your ModMail ID is \`${modmail_id}\``,
      ephemeral: true,
    });

    console.log(
      `${interaction.user.username} has created a modmail "${modmail_id}"`
    );
  } else if (interaction.customId === "forum") {
    /////////////////////////////////////////////////////////////////////////////////////
    await interaction.deferReply({ ephemeral: true });
    const title = interaction.fields.getTextInputValue("title");
    const version = interaction.fields.getTextInputValue("version");
    const logs =
      interaction.fields.getTextInputValue("logs") ?? "No logs given";
    const spark =
      interaction.fields.getTextInputValue("spark") ?? "No spark given";
    const description = interaction.fields.getTextInputValue("description");

    let forumData = await Forum.findOne();

    if (!forumData) {
      forumData = new Forum({
        index: 0,
        forums: [],
      });
    }

    const forum_id = forumData.index + 1;
    await forumData.save();

    let settings = await Settings.findOne();

    const userForum = settings.user_forums.find(
      (user) => user.user_id === interaction.user.id
    );

    if (userForum) {
      userForum.last_forum_timestamp = currentTime; // Update timestamp
    } else {
      settings.user_forums.push({
        user_id: interaction.user.id,
        last_forum_timestamp: currentTime, // Set new timestamp
      });
    }

    await settings.save();

    const member = interaction.guild.members.cache.get(interaction.user.id);
    const forumChannel = interaction.guild.channels.cache.get(
      settings.forum_channel_id
    );

    const post = await forumChannel.threads.create({
      name: title,
      message: {
        content: `\`Forum Post by\` <@${interaction.user.id}>\n\nPost ID: ${forum_id}\nVersion: ${version}\nLogs: ${logs}\nSpark: ${spark}\n\n\`\`\`${description}\`\`\``,
      },
      // appliedTags: [""],
    });

    const closeEmbed = new EmbedBuilder()
      .setTitle("Closing Forums")
      .setDescription(
        "If you wish to close this forum, either press the button attached below, or use the `/close` command"
      )
      .setFooter({
        text: "KasaiSora Universe ModMail",
        iconURL: client.user.displayAvatarURL(),
      })
      .setColor("Blurple")
      .setTimestamp();

    const closeButton = new ButtonBuilder()
      .setCustomId("btn_close")
      .setLabel("Close Post")
      .setStyle(ButtonStyle.Danger);

    const button = new ActionRowBuilder().addComponents(closeButton);

    post.send({ embeds: [closeEmbed], components: [button] });

    const dmEmbed = new EmbedBuilder()
      .setTitle("Forum Post Created")
      .setDescription(
        `Forum post has successfully been created! Please wait for a member to help you, while waiting, please don't ping any member / staff member.`
      )
      .addFields(
        { name: "Forum ID", value: `${forum_id}`, inline: true },
        { name: "Your ID", value: interaction.user.id, inline: true },
        { name: "Post ID", value: post.id, inline: true },
        { name: "Post", value: `<#${post.id}>` }
      )
      .setFooter({
        text: "KasaiSora Universe Community Forums",
        iconURL: client.user.displayAvatarURL(),
      })
      .setColor("Blurple")
      .setTimestamp();

    try {
      await member.send({
        embeds: [dmEmbed],
        content: `\`\`\`Title: ${title}\nVersion: ${version}\nLogs: ${logs}\nSpark: ${spark}\`\`\`\n\n\`\`\`${description}\`\`\``,
      });
    } catch (error) {}

    forumData.forums.push({
      forum_id: forum_id,
      sender_id: interaction.user.id,
      root_channel_id: interaction.channel.id,
      timestamp: new Date(),
      resolved: false,
      post_id: post.id,
    });

    forumData.index = forum_id;
    await forumData.save();

    await interaction.editReply({
      content: `Your Forum Support Post has been created at <#${post.id}>! You should have recieved a DM from the bot containing the information of your Post, if not, your Post ID is \`${forum_id}\``,
      ephemeral: true,
    });

    console.log(
      `${interaction.user.username} has created a forum "${forum_id}"`
    );
  }
};
