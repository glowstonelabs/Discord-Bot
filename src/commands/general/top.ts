import {
  Client,
  CommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import UserLevel from '../../models/userLevelSchema';

export default {
  name: 'top',
  description: 'Shows the top 10 users by level and XP.',
  execute: async (_client: Client, interaction: CommandInteraction) => {
    try {
      const guildId = interaction.guildId!;
      const topUsers = await UserLevel.find({ guildId })
        .sort({ level: -1, xp: -1 })
        .limit(10)
        .lean();
      if (!topUsers.length) {
        await interaction.reply({
          content:
            "No one's on the leaderboard yet! Participate in XP drops to earn XP.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      let leaderboard = '';
      for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];
        leaderboard += `**${i + 1}.** <@${user.userId}> - Level: **${user.level}** (XP: ${user.xp})\n`;
      }
      const embed = new EmbedBuilder()
        .setTitle('🏆 Server Leaderboard 🏆')
        .setDescription('Top 10 users by Level and XP:')
        .addFields({ name: 'Rankings', value: leaderboard })
        .setColor(0x9b59b6)
        .setFooter({ text: `Total users tracked: ${topUsers.length}` })
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(`Error executing top command: ${error}`);
      await interaction.reply({
        content: '❗ An error occurred while executing the command.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
