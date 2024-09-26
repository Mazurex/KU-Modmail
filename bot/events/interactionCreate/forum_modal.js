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

  if (interaction.customId === "forum") {
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
    const settings = await Settings.findOne();
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const forumChannel = interaction.guild.channels.cache.get(
      settings.forum_channel_id
    );

    const post = await forumChannel.threads.create({
      name: title,
      message: {
        content: `\`Forum Post by ${interaction.user.username}\`\n\n\`\`\`Post ID: ${forum_id}\nVersion: ${version}\nLogs: ${logs}\nSpark: ${spark}\`\`\`\n\n\`\`\`${description}\`\`\``,
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
      member.send({ embeds: [dmEmbed] });
      member.send({
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

    await interaction.reply({
      content: `Your Forum Support Post has been created at <#${post.id}>! You should have recieved a DM from the bot containing the information of your Post, if not, your Post ID is \`${forum_id}\``,
      ephemeral: true,
    });
  }
};
