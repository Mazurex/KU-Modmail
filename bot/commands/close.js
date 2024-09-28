const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

const Settings = require("../models/settings");
const Forum = require("../models/forum");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("close_forum")
    .setDescription("Close a Forum Post")
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("Which Forum Post to Close")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Why are you closing this post")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const forum_id = interaction.options.getInteger("id");
    const reason = interaction.options.getString("reason");

    await interaction.deferReply({ ephemeral: true });
    const forum = await Forum.findOne();
    const settings = await Settings.findOne();
    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (!forum || !settings) {
      return interaction.editReply({
        content:
          "Error with the database, create a ModMail/Forum and try again",
      });
    }

    const userForum = forum.forums.find((user) => user.forum_id === forum_id);
    if (!userForum) {
      return interaction.editReply({
        content: "Incorrect Post ID or that Post doesn't exist",
      });
    }

    if (userForum.resolved == true) {
      return interaction.editReply({
        content: "This Post has already been closed!",
      });
    }

    if (
      interaction.user.id === userForum.sender_id ||
      member.permissions.has(PermissionFlagsBits.Administrator) ||
      member.permissions.has(PermissionFlagsBits.ModerateMembers) ||
      member.roles.cache.get(settings.helper_role_id)
    ) {
      const closeButton = new ButtonBuilder()
        .setCustomId("cmd_close")
        .setLabel("Confirm Close")
        .setStyle(ButtonStyle.Danger);

      const button = new ActionRowBuilder().addComponents(closeButton);

      const confirmEmbed = new EmbedBuilder()
        .setTitle("Confirm Post Close")
        .setDescription(
          `Are you sure you want to close Post \`${userForum.forum_id}\`? This will delete the post FOREVER`
        )
        .setFooter({
          text: "KasaiSora Universe ModMail",
          iconURL: client.user.displayAvatarURL(),
        })
        .setColor("Blurple")
        .setTimestamp();

      const btn_message = await interaction.editReply({
        embeds: [confirmEmbed],
        components: [button],
      });

      const collectorFilter = (btn) => btn.customId == "cmd_close";
      const collector = btn_message.createMessageComponentCollector({
        filter: collectorFilter,
        time: 60_000,
      });

      collector.on("collect", async () => {
        const postChannel = interaction.guild.channels.cache.get(
          userForum.post_id
        );

        if (!postChannel) {
          return interaction.editReply({
            content: "This channel doesn't exist!",
          });
        }

        postChannel.delete();
        userForum.resolved = true;

        const logEmbed = new EmbedBuilder()
          .setTitle("Forum Post Closed")
          .addFields(
            { name: "Deletor", value: interaction.user.username, inline: true },
            {
              name: "Deleted ID",
              value: `${userForum.forum_id}`,
              inline: true,
            },
            { name: "Reason", value: reason }
          )
          .setFooter({
            text: "KasaiSora Universe ModMail",
            iconURL: client.user.displayAvatarURL(),
          })
          .setColor("Blurple")
          .setTimestamp();

        const logChannel = interaction.guild.channels.cache.get(
          settings.log_channel_id
        );
        logChannel.send({ embeds: [logEmbed] });

        const ownerMember = interaction.guild.members.cache.get(
          userForum.sender_id
        );

        try {
          await ownerMember.send({
            content: `Your post (ID: \`${userForum.forum_id}\`) has been closed, if this was unexpected, ask a staff member! Reason:\n\n\`\`\`${reason}\`\`\``,
          });
        } catch (error) {}
      });

      collector.on("end", () => {
        if (!interaction.guild.channels.cache.get(userForum.post_id)) return;
        interaction.editReply({
          content: "This button has expired!",
          embeds: [],
          components: [],
        });
      });
    } else {
      interaction.editReply({
        content: "This isn't your forum so you cannot close it!",
      });
    }
    await forum.save();
  },
};
