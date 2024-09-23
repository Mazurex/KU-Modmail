const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const Settings = require("../models/settings");
const Modmail = require("../models/modmail");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resolve")
    .setDescription("Resolve a ModMail")
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("Which ModMail to resolve (via ModMail ID)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Why are you resolving this ModMail")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("dm_message")
        .setDescription("What should the DM message be")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, client) {
    const modmail_id = interaction.options.getInteger("id");
    const reason = interaction.options.getString("reason");

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

    const dm_content =
      interaction.options.getString("dm_message") ??
      `Your ModMail message (ID: \`${userModmail.modmail_id}\`) has been resolved! Unfortunately we are unable to tell you the action taken!`;

    const modmail_message = await modmail_channel.messages.fetch(
      userModmail.modmail_message_id
    );

    if (!modmail_message) {
      return interaction.editReply({
        content:
          "There was an error with the modmail! Error code `3`, please send this to Mazurex!",
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

    const member = interaction.guild.members.cache.get(userModmail.sender_id);
    if (!member) {
      return interaction.editReply({
        content:
          "There was an error with the modmail! Error code `5`, please send this to Mazurex!",
      });
    }

    const log_channel = interaction.guild.channels.cache.get(
      settings.log_channel_id
    );

    if (!log_channel) {
      return interaction.editReply({
        content:
          "There was an error with the modmail! Error code `2`, please send this to Mazurex!",
        ephemeral: true,
      });
    }

    if (userModmail.resolved == false) {
      userModmail.resolved = true;
      modmail_message.reactions.removeAll().then(() => {
        modmail_message.react("<:resolved:1287504564190187531>");
      });
      const resolvedEmbed = new EmbedBuilder()
        .setTitle(
          `${userModmail.modmail_id} || Resolved <:resolved:1287504564190187531>`
        )
        .setDescription(
          "This thread has now been resolved, meaning it is now archived, if this was a mistake, run the same /resolve command to undo it"
        )
        .setFooter({
          text: "KasaiSora Universe ModMail",
          iconURL: client.user.displayAvatarURL(),
        })
        .setColor("Green")
        .setTimestamp();
      thread.send({ embeds: [resolvedEmbed] });

      try {
        member.send(dm_content);
      } catch (error) {}

      interaction.editReply({
        content: "This ticket has now been resolved!",
        ephemeral: true,
      });
      await thread.setArchived(true);
    } else {
      userModmail.resolved = false;
      await thread.setArchived(false);
      modmail_message.reactions.removeAll().then(() => {
        modmail_message.react("<:unresolved:1287504576651591730>");
      });
      const unresolvedEmbed = new EmbedBuilder()
        .setTitle(
          `${userModmail.modmail_id} || Unresolved <:unresolved:1287504576651591730>`
        )
        .setDescription(
          "This thread has been unresolved, meaning it is no longer archived and is open again, if this was a mistake, run the same /resolve command to undo it"
        )
        .setFooter({
          text: "KasaiSora Universe ModMail",
          iconURL: client.user.displayAvatarURL(),
        })
        .setColor("Red")
        .setTimestamp();
      thread.send({ embeds: [unresolvedEmbed] });
      interaction.editReply({
        content: "This ticket is no longer resolved!",
        ephemeral: true,
      });

      try {
        member.send({
          content: `Your ModMail (ID: \`${userModmail.modmail_id}\`) has just been changed to unresolved by the staff team. This could be because your issue was accidentally closed or because we are working on a revision.`,
        });
      } catch (error) {}
    }

    modmail.save();

    const embed = new EmbedBuilder()
      .setTitle("ModMail Resolve")
      .setFields(
        { name: "Resolver", value: `<@${interaction.user.id}>`, inline: true },
        {
          name: "ModMail ID",
          value: `<@${userModmail.modmail_id}>`,
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

    log_channel.send({ embeds: [embed] });
  },
};
