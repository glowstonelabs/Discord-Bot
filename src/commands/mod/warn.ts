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

export default {
  name: 'warn',
  description: '✅ Issues a warning to a user.',
  options: [
    {
      name: 'target-user',
      description: 'The user to warn',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for the warning',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],

  /**
   * Execute method to handle the warn command
   * @param {Client} client - The Discord client
   * @param {CommandInteraction} interaction - The interaction object
   */
  execute: async (_client: Client, interaction: CommandInteraction) => {
    const targetUser = (interaction.options as CommandInteractionOptionResolver).getUser(
      'target-user',
    );
    const reason =
      (interaction.options as CommandInteractionOptionResolver).getString('reason') ||
      'No reason provided';

    await interaction.deferReply({ ephemeral: true });

    if (!targetUser) {
      await interaction.editReply({
        content: "❌ That user doesn't exist in this server.",
        // @ts-ignore - no
        ephemeral: true,
      });
      return;
    }

    if (targetUser.bot) {
      await interaction.editReply({
        content: "🤖 I can't warn a bot.",
        // @ts-ignore - no
        ephemeral: true,
      });
      return;
    }

    const guildMember = await interaction.guild?.members.fetch(targetUser.id);
    if (!guildMember) {
      await interaction.editReply({
        content: '❌ That user is not a member of this server.',
        // @ts-ignore - no
        ephemeral: true,
      });
      return;
    }

    const targetUserRolePosition = guildMember.roles.highest.position;
    const requestUserRolePosition = (interaction.member?.roles as GuildMemberRoleManager).highest
      .position;
    const botRolePosition = interaction.guild?.members.me?.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply({
        content: "🚫 You can't warn that user because they have the same/higher role than you.",
        // @ts-ignore - no
        ephemeral: true,
      });
      return;
    }

    if (botRolePosition === undefined || targetUserRolePosition >= botRolePosition) {
      await interaction.editReply({
        content: "🚫 I can't warn that user because they have the same/higher role than me.",
        // @ts-ignore - no
        ephemeral: true,
      });
      return;
    }

    // Here you would typically log the warning to a database or a file
    // For simplicity, we'll just send a message to the channel
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      // @ts-ignore - no
      .setTitle('User Warned 🚫')
      .setDescription(`**${targetUser.tag}** has been warned.`)
      .addFields({ name: 'Reason', value: reason, inline: true })
      .setFooter({
        text: `Action by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();
    // @ts-ignore - no
    await interaction.editReply({ embeds: [embed], ephemeral: true });
  },
};
