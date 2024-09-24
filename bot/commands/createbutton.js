const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("createbutton")
    .setDescription("Create a modmail button")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("What button are you creating")
        .addChoices(
          { name: "ModMail", value: "modmail" },
          { name: "Support Forum", value: "forum" }
        )
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("target_channel")
        .setDescription("What channel should the button be sent in")
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("What should the embed title be")
        .setMaxLength(25)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("What should the embed description be")
        .setMaxLength(256)
    )
    .addStringOption((option) =>
      option
        .setName("button_title")
        .setDescription("What should the embed create modmail button be")
        .setMaxLength(20)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client) {
    const channel =
      interaction.options.getChannel("target_channel") ?? interaction.channel;
    await interaction.deferReply({ ephemeral: true });

    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const button_title = interaction.options.getString("button_title");

    const type = interaction.options.getString("type");

    if (type == "modmail") {
      if (!title) {
        t = "KasaiSora Universe ModMail";
      } else {
        t = title;
      }
      if (!button_title) {
        bt_t = "Open ModMail";
      } else {
        bt_t = button_title;
      }
      if (!description) {
        d =
          "Press the button **below** to send a ModMail to the staff team, and we will look at it as soon as we can!\n\nModMail Rules:\n**1.** Don't spam ModMail's, you not receiving a followup doesn't mean we haven't looked into it.\n**2.** Be straightforward, but descriptive with your ModMails.\n**3.** Don't ask about the status of your ModMail.\n**4.** Don't misuse ModMails (such as asking for free materials).";
      } else {
        d = description;
      }

      const button = new ButtonBuilder()
        .setCustomId("modmail_button")
        .setLabel(bt_t)
        .setStyle(ButtonStyle.Primary);

      const actionRow = new ActionRowBuilder().addComponents(button);

      const embed = new EmbedBuilder()
        .setTitle(t)
        .setDescription(d)
        .setFooter({
          text: "KasaiSora Universe ModMail",
          iconURL: client.user.displayAvatarURL(),
        })
        .setColor("Blurple");

      interaction.channel.send({ embeds: [embed], components: [actionRow] });
      interaction.editReply({
        content: `Successfully sent ModMail button in <#${channel.id}>!`,
      });
    } else if (type == "forum") {
      if (!title) {
        t = "KasaiSora Universe Support Forums";
      } else {
        t = title;
      }
      if (!button_title) {
        bt_t = "Create Post";
      } else {
        bt_t = button_title;
      }
      if (!description) {
        d =
          "Press the button **below** to create a Forum Post for members to help you!\n\nForum Rules:\n**1.** Be descriptive in your post, to ensure we can help to the best of our abilities.\n**2.** Don't ping staff/other members to get help faster, it doesn't work.";
      } else {
        d = description;
      }

      const button = new ButtonBuilder()
        .setCustomId("forum_button")
        .setLabel(bt_t)
        .setStyle(ButtonStyle.Primary);

      const actionRow = new ActionRowBuilder().addComponents(button);

      const embed = new EmbedBuilder()
        .setTitle(t)
        .setDescription(d)
        .setFooter({
          text: "KasaiSora Universe Forum",
          iconURL: client.user.displayAvatarURL(),
        })
        .setColor("Blurple");

      interaction.channel.send({ embeds: [embed], components: [actionRow] });
      interaction.editReply({
        content: `Successfully sent Forum button in <#${channel.id}>!`,
      });
    }
  },
};
