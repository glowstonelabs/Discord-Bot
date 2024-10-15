import {
  // @ts-ignore application
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  EmbedBuilder,
  GuildMemberRoleManager,
  // @ts-ignore permission
  PermissionFlagsBits,
} from "discord.js";
import ms from "ms";

export default {
  name: "timeout",
  description: "⏳ Temporarily timeout a user.",
  options: [
    {
      name: "target-user",
      description: "The user to timeout 🛑",
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: "duration",
      description: "The duration of the timeout (e.g., 1d, 1h, 5m) ⏰",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the timeout (optional) 📝",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],

  execute: async (_client: Client, interaction: CommandInteraction) => {
    // @ts-ignore getting mentionable option
    const mentionable = interaction.options.getMentionable("target-user");
    // @ts-ignore getting string option
    const duration = interaction.options.getString("duration");
    const reason =
      // @ts-ignore getting string option
      interaction.options.getString("reason") || "No reason provided";

    await interaction.deferReply({ ephemeral: true });

    const targetUser = await interaction.guild?.members.fetch(mentionable?.id);
    if (!targetUser) {
      await interaction.editReply({
        content: "❌ That user doesn't exist in this server.",
        // @ts-ignore ephemeral
        ephemeral: true,
      });
      return;
    }

    if (targetUser.user.bot) {
      await interaction.editReply({
        content: "🤖 I can't timeout a bot.",
        // @ts-ignore ephemeral
        ephemeral: true,
      });
      return;
    }

    const msDuration = ms(duration);
    if (isNaN(msDuration)) {
      await interaction.editReply({
        content: "⏳ Please provide a valid timeout duration.",
        // @ts-ignore ephemeral
        ephemeral: true,
      });
      return;
    }

    if (msDuration < 5000 || msDuration > 2.419e9) {
      await interaction.editReply({
        content:
          "⏳ Timeout duration cannot be less than 5 seconds or more than 28 days.",
        // @ts-ignore ephemeral
        ephemeral: true,
      });
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = (
      interaction.member?.roles as GuildMemberRoleManager
    ).highest.position;
    const botRolePosition =
      interaction.guild?.members.me?.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply({
        content:
          "🚫 You can't timeout that user because they have the same/higher role than you.",
        // @ts-ignore ephemeral
        ephemeral: true,
      });
      return;
    }

    if (
      botRolePosition === undefined ||
      targetUserRolePosition >= botRolePosition
    ) {
      await interaction.editReply({
        content:
          "🚫 I can't timeout that user because they have the same/higher role than me.",
        // @ts-ignore ephemeral
        ephemeral: true,
      });
      return;
    }

    try {
      await targetUser.timeout(msDuration, reason);

      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        // @ts-ignore title
        .setTitle("User Timed Out ⏳")
        .setDescription(`**${targetUser.user.tag}** has been timed out.`)
        .addFields(
          { name: "Duration", value: duration, inline: true },
          { name: "Reason", value: reason, inline: true }
        )
        .setFooter({
          text: `Action by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();
      // @ts-ignore ephemeral
      await interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await interaction.editReply({
        content: `❌ An error occurred while trying to timeout the user: ${errorMessage}`,
        // @ts-ignore ephemeral
        ephemeral: true,
      });
    }
  },
};
