import {
  //  @ts-ignore: Ignoring type errors for title
  PermissionFlagsBits as _PermissionFlagsBits,
  EmbedBuilder,
  ChatInputCommandInteraction,
  // @ts-ignore: Ignoring type errors for title
  ApplicationCommandOptionType,
  Client,
} from "discord.js";

export default {
  name: "ban",
  description: "🔨 Bans a member from this server!",
  options: [
    {
      name: "target-user",
      description: "The user to ban",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the ban",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "duration",
      description: "The duration of the ban",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  /**
   * Execute method to handle the ban command
   * @param {Client} client - The Discord client
   * @param {ChatInputCommandInteraction} interaction - The interaction object
   */
  execute: async (
    _client: Client,
    interaction: ChatInputCommandInteraction
  ) => {
    const targetUserOption = interaction.options.get("target-user");
    if (!targetUserOption) {
      await interaction.editReply(
        "❌ **Error:** Target user option is missing."
      );
      return;
    }
    const targetUserId = targetUserOption.value;
    const reason =
      (interaction.options.get("reason")?.value as string) ||
      "No reason provided.";
    const duration =
      (interaction.options.get("duration")?.value as string) || "Permanent";

    await interaction.deferReply();

    try {
      const targetUser = await interaction.guild?.members.fetch(targetUserId);
      if (!targetUser) {
        await interaction.editReply("❌ **Error:** User not found.");
        return;
      }

      const dmEmbed = new EmbedBuilder()
        // @ts-ignore: Ignoring type errors for title
        .setTitle("🔨 You Have Been Banned")
        .setColor(0xff0000)
        .setDescription(
          `You have been banned from **${interaction.guild?.name}**.`
        )
        .addFields(
          { name: "Reason", value: reason },
          { name: "Banned by", value: interaction.user.tag },
          { name: "Duration", value: duration }
        )
        .setTimestamp()
        .setFooter({
          text: `Banned by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ extension: "jpg" }),
        });

      await targetUser.send({ embeds: [dmEmbed] });

      await targetUser.ban({ reason });

      const successEmbed = new EmbedBuilder()
        // @ts-ignore: Ignoring type errors for title
        .setTitle("🔨 User Banned")
        .setColor(0xff0000)
        .setDescription(`**${targetUser.user.tag}** has been banned.`)
        .addFields(
          { name: "Reason", value: reason },
          { name: "Banned by", value: interaction.user.tag },
          { name: "Duration", value: duration }
        )
        .setTimestamp()
        .setFooter({
          text: `Banned by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ extension: "jpg" }),
        });

      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply("There was an error trying to ban the user.");
    }
  },
};
