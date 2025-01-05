import {
  // @ts-ignore - no
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  GuildMemberRoleManager,
  MessageFlags,
  // @ts-ignore - no
  PermissionFlagsBits,
  // @ts-ignore - no
  UserResolvable,
} from 'discord.js';

export default {
  name: 'kick',
  description: '👢 Kicks a member from this server!',
  options: [
    {
      name: 'target-user',
      description: 'The user to kick',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for the kick',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],

  /**
   * Execute method to handle the kick command
   * @param {Client} client - The Discord client
   * @param {ChatInputCommandInteraction} interaction - The interaction object
   */
  execute: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const targetUserOption = interaction.options.get('target-user');
    if (!targetUserOption) {
      await interaction.reply({
        content: '❌ **Error:** Target user option is missing.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const targetUserId = targetUserOption.value as string;
    const reason = (interaction.options.get('reason')?.value as string) || 'No reason provided.';

    await interaction.deferReply({ ephemeral: true });

    if (!interaction.guild) {
      await interaction.editReply({
        content: '❌ **Error:** This command can only be used in a server.',
        // @ts-ignore - no
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const targetUser = await interaction.guild.members.fetch(targetUserId as UserResolvable);

    if (!targetUser) {
      await interaction.editReply({
        content: "❌ **Error:** That user doesn't exist in this server.",
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
        content: "🚫 You can't kick that user because they have the same/higher role than you.",
        // @ts-ignore - no
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (botRolePosition === undefined || targetUserRolePosition >= botRolePosition) {
      await interaction.editReply({
        content: "🚫 I can't kick that user because they have the same/higher role than me.",
        // @ts-ignore - no
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await targetUser.kick(reason);

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        // @ts-ignore - no
        .setTitle('User Kicked 👢')
        .setDescription(`**${targetUser.user.tag}** has been kicked.`)
        .addFields({ name: 'Reason', value: reason, inline: true })
        .setFooter({
          text: `Action by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();
      // @ts-ignore - no
      await interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await interaction.editReply({
        content: `❌ An error occurred while trying to kick the user: ${errorMessage}`,
        // @ts-ignore - no
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
