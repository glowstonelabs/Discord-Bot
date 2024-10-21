import { Client, CommandInteraction, EmbedBuilder, User, Role } from 'discord.js';

export default {
  name: 'userinfo',
  description: 'ℹ Shows information about a specific user',
  options: [
    {
      name: 'target-user',
      type: 6, // USER type
      description: 'The user to get information about',
      required: true,
    },
  ],
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  execute: async (_client: Client, interaction: CommandInteraction) => {
    try {
      const targetUser = interaction.options.get('target-user')?.user as User;

      if (!targetUser) {
        await interaction.reply({
          content: '❗ You must specify a user to get information about.',
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply();

      const guild = interaction.guild;
      if (!guild) {
        await interaction.editReply({
          content: '❗ This command can only be used in a server.',
          // @ts-ignore - shut up
          ephemeral: true,
        });
        return;
      }

      const member = await guild.members.fetch(targetUser.id);
      const joinDate = member.joinedAt ? member.joinedAt.toDateString() : 'Unknown';
      const roles = member.roles.cache
        .filter((role: Role) => role.name !== '@everyone')
        .sort((a: Role, b: Role) => b.position - a.position)
        .map((role: Role) => `<@&${role.id}>`)
        .join(', ');
      const nickname = member.nickname ? member.nickname : 'No';

      const username =
        targetUser.discriminator && targetUser.discriminator !== '0'
          ? `${targetUser.username}#${targetUser.discriminator}`
          : targetUser.username;

      const userInfoEmbed = new EmbedBuilder()
        .setColor(0x3498db)
        // @ts-ignore - shut up
        .setTitle(`ℹ️ User Info: ${username}`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { name: '👤 Username', value: username, inline: true },
          { name: '🆔 ID', value: targetUser.id, inline: true },
          { name: '🤖 Bot', value: targetUser.bot ? 'Yes' : 'No', inline: true },
          { name: '📅 Created At', value: targetUser.createdAt.toDateString(), inline: true },
          { name: '📅 Joined Server At', value: joinDate, inline: true },
          { name: '🏷️ Nickname', value: nickname, inline: true },
          { name: '🔖 Roles', value: roles || 'None', inline: true },
        )
        .setTimestamp()
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.editReply({ embeds: [userInfoEmbed] });
    } catch (error) {
      console.error(`Error executing userinfo command: ${error}`);
      await interaction.editReply({
        content: '❗ An error occurred while executing the command.',
        // @ts-ignore - shut up
        ephemeral: true,
      });
    }
  },
};
