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
  if (interaction.customId == "modmail_button") {
    const currentTime = new Date();

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({
        modmail_channel_id: 0,
        log_channel_id: 0,
        modmail_cooldown_s: 3600,
        forum_cooldown_s: 3600,
        user_modmails: [],
        user_forums: [],
      });
    }

    await settings.save();

    const bannedUser = settings.banned_users.find(
      (user) => user.user_id === interaction.user.id
    );

    if (bannedUser) {
      return interaction.reply({
        content: `You are banned from using the bot. Reason: \`${bannedUser.reason}\``,
        ephemeral: true,
      });
    }

    const modmailChannel = interaction.guild.channels.cache.get(
      settings.modmail_channel_id
    );

    const loggingChannel = interaction.guild.channels.cache.get(
      settings.log_channel_id
    );

    if (!modmailChannel) {
      return interaction.reply({
        content:
          "There was an error with the modmail! Error code `1`, please send this to a moderator!",
        ephemeral: true,
      });
    }

    if (!loggingChannel) {
      return interaction.reply({
        content:
          "There was an error with the modmail! Error code `2`, please send this to a moderator!",
        ephemeral: true,
      });
    }

    const userModmail = settings.user_modmails.find(
      (user) => user.user_id === interaction.user.id
    );

    if (userModmail) {
      const lastTimeStamp = userModmail.last_modmail_timestamp;
      const cooldown = settings.modmail_cooldown_s * 1000;
      const timeSinceLastModmail = currentTime - lastTimeStamp;

      if (timeSinceLastModmail < cooldown) {
        const cooldownEndTimestamp = Math.floor(
          (currentTime.getTime() + (cooldown - timeSinceLastModmail)) / 1000
        );
        return interaction.reply({
          content: `You can send a ModMail again <t:${cooldownEndTimestamp}:R>`,
          ephemeral: true,
        });
      }
    }

    // if (userModmail) {
    //   userModmail.last_modmail_timestamp = currentTime;
    // } else {
    //   settings.user_modmails.push({
    //     user_id: interaction.user.id,
    //     last_modmail_timestamp: currentTime,
    //   });
    // }

    await settings.save();

    const modal = new ModalBuilder()
      .setCustomId("modmail")
      .setTitle("KasaiSora Universe ModMail");

    const title = new TextInputBuilder()
      .setCustomId("title")
      .setLabel("Modmail Title")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(25)
      .setRequired(true);
    const description = new TextInputBuilder()
      .setCustomId("content")
      .setLabel("ModMail Contents")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(256)
      .setRequired(true);

    const titleActionRow = new ActionRowBuilder().addComponents(title);
    const descriptionActionRow = new ActionRowBuilder().addComponents(
      description
    );

    modal.addComponents(titleActionRow, descriptionActionRow);

    await interaction.showModal(modal);
  } else if (interaction.customId == "forum_button") {
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const currentTime = new Date();

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({
        modmail_channel_id: 0,
        log_channel_id: 0,
        modmail_cooldown_s: 3600,
        forum_cooldown_s: 3600,
        user_modmails: [],
        user_forums: [],
      });
    }

    await settings.save();

    const bannedUser = settings.banned_users.find(
      (user) => user.user_id === interaction.user.id
    );

    if (bannedUser) {
      return interaction.reply({
        content: `You are banned from using the bot. Reason: \`${bannedUser.reason}\``,
        ephemeral: true,
      });
    }

    const forumChannel = interaction.guild.channels.cache.get(
      settings.forum_channel_id
    );

    const loggingChannel = interaction.guild.channels.cache.get(
      settings.log_channel_id
    );

    if (!forumChannel) {
      return interaction.reply({
        content:
          "There was an error with the forum! Error code `1`, please send this to a moderator!",
        ephemeral: true,
      });
    }

    if (!loggingChannel) {
      return interaction.reply({
        content:
          "There was an error with the forum! Error code `2`, please send this to a moderator!",
        ephemeral: true,
      });
    }

    const userForum = settings.user_forums.find(
      (user) => user.user_id == interaction.user.id
    );

    if (userForum) {
      const lastTimeStamp = userForum.last_forum_timestamp;
      const cooldown = settings.forum_cooldown_s * 1000;
      const timeSinceLastForum = currentTime - lastTimeStamp;

      if (timeSinceLastForum < cooldown) {
        const cooldownEndTimestamp = Math.floor(
          (currentTime.getTime() + (cooldown - timeSinceLastForum)) / 1000
        );
        return interaction.reply({
          content: `You can send a Forum again <t:${cooldownEndTimestamp}:R>`,
          ephemeral: true,
        });
      }
    }

    // if (userForum) {
    //   userForum.last_forum_timestamp = currentTime;
    // } else {
    //   settings.user_forums.push({
    //     user_id: interaction.user.id,
    //     last_forum_timestamp: currentTime,
    //   });
    // }

    // await settings.save();

    const modal = new ModalBuilder()
      .setCustomId("forum")
      .setTitle("KasaiSora Universe Community");

    const title = new TextInputBuilder()
      .setCustomId("title")
      .setLabel("A BRIEF OVERVIEW OF YOUR PROBLEM")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(64)
      .setRequired(true);
    const version = new TextInputBuilder()
      .setCustomId("version")
      .setLabel("PROVIDE THE OUTPUT OF RUNNING /VERSION")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(69)
      .setRequired(true);
    const logs = new TextInputBuilder()
      .setCustomId("logs")
      .setLabel("PLEASE SHARE YOUR MCLO.GS LOG FILE")
      .setPlaceholder("https://mclo.gs/S1gMa")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(69)
      .setRequired(false);
    const spark = new TextInputBuilder()
      .setCustomId("spark")
      .setLabel("PLEASE SHARE YOUR SPARK PROFILER REPORT")
      .setPlaceholder("https://spark.lucko.me/SUsSy0BaKA")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(69)
      .setRequired(false);
    const description = new TextInputBuilder()
      .setCustomId("description")
      .setLabel("A DETAILED DESCRIPTION OF YOUR PROBLEM")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(2100)
      .setRequired(true);

    const titleActionRow = new ActionRowBuilder().addComponents(title);
    const versionActionRow = new ActionRowBuilder().addComponents(version);
    const logsActionRow = new ActionRowBuilder().addComponents(logs);
    const sparkActionRow = new ActionRowBuilder().addComponents(spark);
    const descriptionActionRow = new ActionRowBuilder().addComponents(
      description
    );

    modal.addComponents(
      titleActionRow,
      versionActionRow,
      logsActionRow,
      sparkActionRow,
      descriptionActionRow
    );
    await interaction.showModal(modal);
  } else if (interaction.customId == "btn_close") {
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
