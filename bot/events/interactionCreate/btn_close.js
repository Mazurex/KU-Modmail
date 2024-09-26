const {
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const Settings = require("../../models/settings");
const Forum = require("../../models/forum");

module.exports = async (client, interaction) => {
  if (interaction.customId == "btn_close") {
    await interaction.deferReply({ ephemeral: true });

    const reason = "No reason specified";

    const forum = await Forum.findOne();
    const settings = await Settings.findOne();

    if (!forum || !settings) {
      return interaction.editReply({
        content:
          "Error with the database, create a ModMail/Forum and try again",
      });
    }

    const userForum = forum.forums.find(
      (user) => user.post_id === interaction.channel.id
    );

    if (userForum.resolved) {
      return interaction.editReply({
        content: "This Post has already been closed!",
      });
    }

    const interactionMember = interaction.guild.members.cache.get(
      interaction.user.id
    );
    if (
      interaction.user.id === userForum.sender_id ||
      interactionMember.permissions.has(PermissionFlagsBits.Administrator) ||
      interactionMember.permissions.has(PermissionFlagsBits.ModerateMembers) ||
      interactionMember.roles.cache.get(settings.helper_role_id)
    ) {
      const confirmButton = new ButtonBuilder()
        .setCustomId("confirm_close")
        .setLabel("Confirm Close")
        .setStyle(ButtonStyle.Danger);

      const buttonActionRow = new ActionRowBuilder().addComponents(
        confirmButton
      );

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

      const confirm_message = await interaction.editReply({
        embeds: [confirmEmbed],
        components: [buttonActionRow],
      });

      const collectorFilter = (btn) => btn.customId == "confirm_close";
      const collector = confirm_message.createMessageComponentCollector({
        filter: collectorFilter,
        time: 5_000,
      });

      collector.on("collect", async () => {
        const postChannel = interaction.channel;

        if (!postChannel) {
          return interaction.editReply({
            content: "This channel doesn't exist!",
          });
        }

        postChannel.delete();
        userForum.resolved = true;
        await forum.save();

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

        const postOwner = interaction.guild.members.cache.get(
          userForum.sender_id
        );

        try {
          postOwner.send({
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
  }
};
