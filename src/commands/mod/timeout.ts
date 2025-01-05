import {
  // @ts-ignore - no
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  GuildMemberRoleManager,
  // @ts-ignore - no
  PermissionFlagsBits,
} from 'discord.js';
// @ts-ignore - no
import ms from 'ms';

export default {
  name: 'timeout',
  description: '⏳ Temporarily timeout a user.',
  options: [
    {
      name: 'target-user',
      description: 'The user to timeout 🛑',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'duration',
      description: 'The duration of the timeout (e.g., 1d, 1h, 5m) ⏰',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for the timeout (optional) 📝',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],

  execute: async (_client: Client, interaction: CommandInteraction) => {
    // @ts-ignore - no
    const mentionable = interaction.options.getMentionable('target-user');
    const duration = (interaction.options as CommandInteractionOptionResolver).getString(
      'duration',
    );
    const reason =
      (interaction.options as CommandInteractionOptionResolver).getString('reason') ||
      'No reason provided';

    await interaction.deferReply({ ephemeral: true });

    const targetUser = await interaction.guild?.members.fetch(mentionable?.id);
    if (!targetUser) {
      await interaction.editReply({
        content: "❌ That user doesn't exist in this server.",
        // @ts-ignore - no
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (targetUser.user.bot) {
      await interaction.editReply({
        content: "🤖 I can't timeout a bot.",
        // @ts-ignore - no
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const durationMs = ms(duration);
    if (!durationMs || durationMs < 1000 || durationMs > 2419200000) {
      await interaction.editReply({
        content: '❌ Please provide a valid duration between 1 second and 28 days.',
        // @ts-ignore - no
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = (interaction.member?.roles as GuildMemberRoleManager).highest
      .position;
    const botRolePosition = interaction.guild?.members.me?.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply({
        content: "🚫 You can't timeout that user because they have the same/higher role than you.",
        // @ts-ignore - no
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (botRolePosition === undefined || targetUserRolePosition >= botRolePosition) {
      await interaction.editReply({
        content: "🚫 I can't timeout that user because they have the same/higher role than me.",
        // @ts-ignore - no
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await targetUser.timeout(durationMs, reason);

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        // @ts-ignore - no
        .setTitle('User Timed Out ⏳')
        .setDescription(`**${targetUser.user.tag}** has been timed out.`)
        .addFields(
          // @ts-ignore - no
          { name: 'Duration', value: duration, inline: true },
          { name: 'Reason', value: reason, inline: true },
        )
        .setFooter({
          text: `Action by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();
      // @ts-ignore - no
      await interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(`Error timing out user: ${error}`);
      await interaction.editReply({
        content: '❌ An error occurred while trying to timeout the user.',
        // @ts-ignore - no
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
