import {
  // @ts-ignore - no
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  EmbedBuilder,
  GuildMemberRoleManager,
  MessageFlags,
  // @ts-ignore - no
  PermissionFlagsBits,
} from 'discord.js';

export default {
  name: 'clearwarnings',
  description: '🚫 Clears all warnings for a user.',
  options: [
    {
      name: 'target-user',
      description: 'The user to clear warnings for',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],

  /**
   * Execute method to handle the clearwarnings command
   * @param {Client} client - The Discord client
   * @param {CommandInteraction} interaction - The interaction object
   */
  execute: async (_client: Client, interaction: CommandInteraction) => {
    // @ts-ignore - no
    const mentionable = interaction.options.getMentionable('target-user');

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
        content: "🤖 I can't clear warnings for a bot.",
        // @ts-ignore - no
        flags: MessageFlags.Ephemeral,
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
          "🚫 You can't clear warnings for that user because they have the same/higher role than you.",
        // @ts-ignore - no
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (
      botRolePosition === undefined ||
      targetUserRolePosition >= botRolePosition
    ) {
      await interaction.editReply({
        content:
          "🚫 I can't clear warnings for that user because they have the same/higher role than me.",
        // @ts-ignore - no
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Here you would typically clear the warnings from a database or a file
    // For simplicity, we'll just send a message to the channel
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      // @ts-ignore - no
      .setTitle('Warnings Cleared')
      .setDescription(
        `All warnings for **${targetUser.user.tag}** have been cleared.`
      )
      .setFooter({
        text: `Action by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();
    // @ts-ignore - no
    await interaction.editReply({ embeds: [embed], ephemeral: true });
  },
};
