import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  MessageFlags,
  // @ts-ignore - no
  UserResolvable,
} from 'discord.js';

export default {
  name: 'unban',
  description: '🔓 Unbans a member from this server!',
  options: [
    {
      name: 'user-id',
      description: 'The ID of the user to unban',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for the unban',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  /**
   * Executes the unban command.
   * @param {Client} _client - The Discord client.
   * @param {ChatInputCommandInteraction} interaction - The interaction object.
   */
  execute: async (
    _client: Client,
    interaction: ChatInputCommandInteraction
  ) => {
    const userId = interaction.options.get('user-id')?.value as string;
    const reason =
      (interaction.options.get('reason')?.value as string) ||
      'No reason provided.';

    await interaction.deferReply();

    try {
      const bannedUsers = await interaction.guild?.bans.fetch();
      const bannedUser = bannedUsers?.get(userId as string);

      if (!bannedUser) {
        await interaction.editReply({
          content: '❌ **Error:** User not found or not banned.',
          // @ts-ignore - no
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.guild?.bans.remove(userId as UserResolvable, reason);

      const successEmbed = new EmbedBuilder()
        // @ts-ignore - no
        .setTitle('🔓 User Unbanned')
        .setColor(0x00ff00)
        .setDescription(`**${bannedUser.user.tag}** has been unbanned.`)
        .addFields(
          { name: 'Reason', value: reason },
          { name: 'Unbanned by', value: interaction.user.tag }
        )
        .setTimestamp()
        .setFooter({
          text: `Unbanned by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ extension: 'jpg' }),
        });

      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(`Error unbanning user: ${error}`);
      await interaction.editReply({
        content:
          '❌ **Error:** An error occurred while trying to unban the user.',
        // @ts-ignore - no
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
