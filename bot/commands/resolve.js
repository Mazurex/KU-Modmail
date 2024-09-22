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
    .addBooleanOption((option) =>
      option
        .setName("dm")
        .setDescription(
          "Should the bot DM the user telling them the ModMail has been resolved"
        )
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
    const dm_bool = interaction.options.getBoolean("dm");
    const dm_content =
      interaction.options.getString("dm_message") ??
      "Your ModMail message has been resolved! Unfortunately we are unable to tell you the action taken!";

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
        content:
          "There was an error with the modmail! Error code `4`, please send this to Mazurex!",
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
      await thread.setArchived(true);

      if (dm_bool === true) {
        const member = interaction.guild.members.cache.get(
          userModmail.sender_id
        );
        if (!member) {
          return interaction.editReply({
            content:
              "There was an error with the modmail! Error code `5`, please send this to Mazurex!",
          });
        }

        try {
          member.send(dm_content);
        } catch (error) {}
      }
    } else {
      userModmail.resolved = false;
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
      await thread.setArchived(false);
    }

    modmail.save();
  },
};
