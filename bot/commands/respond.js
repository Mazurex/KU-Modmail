const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Modmail = require("../models/modmail");
const Settings = require("../models/settings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("respond")
    .setDescription("Add to your modmail, or respond to the user")
    .addIntegerOption((option) =>
      option
        .setName("modmail_id")
        .setDescription("ID of the ModMail you wish to respond to")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("What do you want to send")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const modmail_id = interaction.options.getInteger("modmail_id");
    const message = interaction.options.getString("message");
    await interaction.deferReply({ ephemeral: true });

    const modmail = await Modmail.findOne();
    const settings = await Settings.findOne();

    if (!modmail || !settings) {
      return interaction.editReply({
        content: "Error with the database, create a ModMail and try again",
      });
    }

    const modmail_channel = interaction.guild.channels.cache.get(
      settings.modmail_channel_id
    );

    if (!modmail_channel) {
      return interaction.editReply({
        content:
          "There was an error with the modmail! Error code `1`, please send this to Mazurex!",
      });
    }

    const userModmail = modmail.modmails.find(
      (user) => user.modmail_id === modmail_id
    );

    if (!userModmail) {
      return interaction.editReply({
        content: "Incorrect ModMail ID or that ModMail doesn't exist",
      });
    }

    const thread = modmail_channel.threads.cache.find(
      (thread) => thread.id === userModmail.thread_id
    );

    if (!thread) {
      return interaction.editReply({
        content: "Invalid ModMail ID, or the ModMail doesn't exist",
      });
    }

    const member = await interaction.guild.members.fetch(userModmail.sender_id);

    if (!member) {
      return interaction.editReply({
        content:
          "There was an error with the modmail! Error code `5`, please send this to Mazurex!",
      });
    }

    if (
      interaction.guild.members.cache
        .get(interaction.user.id)
        .permissions.has(PermissionFlagsBits.Administrator) ||
      interaction.guild.members.cache
        .get(interaction.user.id)
        .permissions.has(PermissionFlagsBits.ModerateMembers)
    ) {
      const sendEmbed = new EmbedBuilder()
        .setTitle(`(${interaction.guild.name} >> <@${userModmail.sender_id}>)`)
        .setDescription(
          `A staff member is reaching out to you via ModMail, if you wish to respond, use the \`/respond\` command:\n\`\`\`${message}\`\`\``
        )
        .setFooter({
          text: "KasaiSora Universe ModMail",
          iconURL: client.user.displayAvatarURL(),
        })
        .setColor("Green")
        .setTimestamp();

      try {
        member.send({ embeds: [sendEmbed] });
      } catch (error) {
        interaction.editReply({ content: "This user is not accepting DM's!" });
      }

      const logEmbed = new EmbedBuilder()
        .setTitle(
          `${interaction.user.username} has responded to ModMail owner:`
        )
        .setDescription(`\`\`\`${message}\`\`\``)
        .setFooter({
          text: "KasaiSora Universe ModMail",
          iconURL: client.user.displayAvatarURL(),
        })
        .setColor("Green")
        .setTimestamp();

      thread.send({ embeds: [logEmbed] });

      interaction.editReply({
        content: `Successfully sent message to ModMail Owner:\n\`\`\`${message}\`\`\``,
      });
    } else {
      if (interaction.user.id == userModmail.sender_id) {
        const sendEmbed = new EmbedBuilder()
          .setTitle(
            `(${interaction.user.username} >> ${interaction.guild.name})`
          )
          .setDescription(
            `A member has sent a response to this ModMail:\n\`\`\`${message}\`\`\``
          )
          .setFooter({
            text: "KasaiSora Universe ModMail",
            iconURL: client.user.displayAvatarURL(),
          })
          .setColor("Green")
          .setTimestamp();

        thread.send({ embeds: [sendEmbed] });

        interaction.editReply({
          content: `Successfully sent message to your ModMail (ID: \`${userModmail.modmail_id}\`):\n\`\`\`${message}\`\`\``,
        });
      } else {
        interaction.editReply({
          content: "I cannot forward this message as it is not your ModMail!",
        });
      }
    }
  },
};
