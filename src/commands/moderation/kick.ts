import {
  Client,
  Interaction as _Interaction,
  // @ts-ignore: Ignoring type errors for title
  PermissionFlagsBits as _PermissionFlagsBits,
  EmbedBuilder,
  ChatInputCommandInteraction,
  // @ts-ignore: Ignoring type errors for title
  ApplicationCommandOptionType,
} from "discord.js";

export default {
  name: "kick",
  description: "👢 Kicks a member from this server!",
  options: [
    {
      name: "target-user",
      description: "The user to kick",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the kick",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  /**
   * Execute method to handle the kick command
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

    await interaction.deferReply();

    if (!interaction.guild) {
      await interaction.editReply(
        "❌ **Error:** This command can only be used in a server."
      );
      return;
    }
    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      await interaction.editReply(
        "❌ **Error:** That user doesn't exist in this server."
      );
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.editReply(
        "❌ **Error:** You can't kick the server owner."
      );
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // highest role of the target user
    const requestUserRolePosition = interaction.member.roles.highest.position; // highest role of the user running the command
    const botMember = interaction.guild.members.me;
    if (!botMember) {
      await interaction.editReply("❌ **Error:** Bot member not found.");
      return;
    }
    const botRolePosition = botMember.roles.highest.position; // highest role of the bot

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "❌ **Error:** You can't kick this user because they have a higher or equal role."
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "❌ **Error:** I can't kick this user because they have a higher or equal role than me."
      );
      return;
    }

    try {
      const dmEmbed = new EmbedBuilder()
        // @ts-ignore: Ignoring type errors for title
        .setTitle("👢 You Have Been Kicked")
        .setColor(0xffa500)
        .setDescription(
          `You have been kicked from **${interaction.guild.name}**.`
        )
        .addFields(
          { name: "Reason", value: reason },
          { name: "Kicked by", value: interaction.user.tag }
        )
        .setTimestamp()
        .setFooter({
          text: `Kicked by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ extension: "jpg" }),
        });

      await targetUser.send({ embeds: [dmEmbed] });

      await targetUser.kick(reason);

      const successEmbed = new EmbedBuilder()
        // @ts-ignore: Ignoring type errors for title
        .setTitle("👢 User Kicked")
        .setColor(0xffa500)
        .setDescription(`**${targetUser.user.tag}** has been kicked.`)
        .addFields(
          { name: "Reason", value: reason },
          { name: "Kicked by", value: interaction.user.tag }
        )
        .setTimestamp()
        .setFooter({
          text: `Kicked by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ extension: "jpg" }),
        });

      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      const errorMessage = (error as Error).message;
      await interaction.editReply(
        `❌ **Error:** Failed to kick the user. ${errorMessage}`
      );
    }
  },
};
