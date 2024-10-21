import { Client, CommandInteraction, EmbedBuilder, Role } from 'discord.js';

export default {
  name: 'roleinfo',
  description: 'Displays information about a specific role.',
  options: [
    {
      name: 'role',
      type: 8, // ROLE type
      description: 'The role to get information about',
      required: true,
    },
  ],
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  execute: async (_client: Client, interaction: CommandInteraction) => {
    try {
      const member = await interaction.guild?.members.fetch(interaction.user.id);
      const hasAdminRole = member?.roles.cache.some(
        (role: Role) => role.name.toLowerCase() === 'administrator',
      );

      if (!hasAdminRole) {
        await interaction.reply({
          content: '❗ You do not have the "Administrator" role to use this command.',
          ephemeral: true,
        });
        return;
      }

      const role = interaction.options.get('role')?.role as Role;

      const roleInfoEmbed = new EmbedBuilder()
        .setColor(role.color)
        // @ts-ignore - shut up
        .setTitle(`ℹ️ Role Info: ${role.name}`)
        .addFields(
          { name: '🆔 Role ID', value: role.id, inline: true },
          { name: '🎨 Color', value: role.hexColor, inline: true },
          {
            name: '📅 Created At',
            value: role.createdAt.toDateString(),
            inline: true,
          },
          {
            name: '🔒 Permissions',
            value: role.permissions.toArray().join(', ') || 'None',
            inline: true,
          },
        )
        .setTimestamp()
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.reply({ embeds: [roleInfoEmbed] });
    } catch (error) {
      console.error(`Error executing roleinfo command: ${error}`);
      await interaction.reply({
        content: '❗ An error occurred while executing the command.',
        ephemeral: true,
      });
    }
  },
};
