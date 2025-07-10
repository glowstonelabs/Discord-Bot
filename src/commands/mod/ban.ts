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
  name: 'ban',
  description: '🔨 Bans a member from this server!',
  options: [
    {
      name: 'target-user',
      description: 'The user to ban',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for the ban',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: 'duration',
      description: 'The duration of the ban',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],

  /**
   * Execute method to handle the ban command
   * @param {Client} client - The Discord client
   * @param {ChatInputCommandInteraction} interaction - The interaction object
   */
  execute: async (
    _client: Client,
    interaction: ChatInputCommandInteraction
  ) => {
    const targetUserOption = interaction.options.get('target-user');
    if (!targetUserOption) {
      await interaction.editReply({
        content: '❌ **Error:** Target user option is missing.',
        // @ts-ignore - no
        flags: 64,
      });
      return;
    }
    const targetUserId = targetUserOption.value as string;
    const reason =
      (interaction.options.get('reason')?.value as string) ||
      'No reason provided.';
    const duration =
      (interaction.options.get('duration')?.value as string) || 'Permanent';

    await interaction.deferReply({ flags: 64 });

    try {
      const targetUser = await interaction.guild?.members.fetch(
        targetUserId as UserResolvable
      );
      if (!targetUser) {
        await interaction.editReply({
          content: '❌ **Error:** User not found.',
          // @ts-ignore - no
          flags: 64,
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
            "🚫 You can't ban that user because they have the same/higher role than you.",
          // @ts-ignore - no
          flags: 64,
        });
        return;
      }

      if (
        botRolePosition === undefined ||
        targetUserRolePosition >= botRolePosition
      ) {
        await interaction.editReply({
          content:
            "🚫 I can't ban that user because they have the same/higher role than me.",
          // @ts-ignore - no
          flags: 64,
        });
        return;
      }

      const dmEmbed = new EmbedBuilder()
        // @ts-ignore - no
        .setTitle('🔨 You Have Been Banned')
        .setColor(0xff0000)
        .setDescription(
          `You have been banned from **${interaction.guild?.name}**.`
        )
        .addFields(
          { name: 'Reason', value: reason },
          { name: 'Banned by', value: interaction.user.tag },
          { name: 'Duration', value: duration }
        )
        .setTimestamp()
        .setFooter({
          text: `Banned by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      try {
        await targetUser.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.error('Failed to send DM to the user:', error);
      }

      await targetUser.ban({ reason });

      const successEmbed = new EmbedBuilder()
        // @ts-ignore - no
        .setTitle('🔨 User Banned')
        .setColor(0x00ff00)
        .setDescription(`**${targetUser.user.tag}** has been banned.`)
        .addFields(
          { name: 'Reason', value: reason },
          {
            name: 'Duration',
            value: duration,
          }
        )
        .setTimestamp()
        .setFooter({
          text: `Banned by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(`Error banning user: ${error}`);
      await interaction.editReply({
        content:
          '❌ **Error:** An error occurred while trying to ban the user.',
        // @ts-ignore - no
        flags: 64,
      });
    }
  },
};
