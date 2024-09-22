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
    .addChannelOption((option) =>
      option
        .setName("target_channel")
        .setDescription("What channel should the button be sent in")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client) {
    const channel =
      interaction.options.getChannel("target_channel") ?? interaction.channel;
    await interaction.deferReply({ ephemeral: true });

    try {
      const button = new ButtonBuilder()
        .setCustomId("modmail_button")
        .setLabel("Open ModMail")
        .setStyle(ButtonStyle.Primary);

      const actionRow = new ActionRowBuilder().addComponents(button);

      const embed = new EmbedBuilder()
        .setTitle("KasaiSora Universe ModMail")
        .setDescription(
          "Press the button **below** to send a ModMail to the staff team, and we will look at it as soon as we can!\n\nModMail Rules:\n**1.** Don't spam ModMail's, you not receiving a followup doesn't mean we haven't looked into it.\n**2.** Be straightforward, but descriptive with your ModMails.\n**3.** Don't ask about the status of your ModMail.\n**4.** Don't misuse ModMails (such as asking for free materials)."
        )
        .setFooter({
          text: "KasaiSora Universe ModMail",
          iconURL: client.user.displayAvatarURL(),
        })
        .setColor("Blurple");

      interaction.channel.send({ embeds: [embed], components: [actionRow] });
      interaction.editReply({
        content: `Successfully sent ModMail button in <#${channel}>!`,
      });
    } catch (error) {
      console.error(error);

      interaction.editReply({ content: "Invalid channel!" });
    }
  },
};
