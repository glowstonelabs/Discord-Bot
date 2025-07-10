import {
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import UserLevel from '../../models/userLevelSchema';
import {
  getXpForLevel,
  getXpUntilNextLevel,
  getProgressBar,
} from '../../utils/levelUtils';

export default {
  name: 'rank',
  description: 'Shows your current XP and level.',
  execute: async (
    _client: Client,
    interaction: ChatInputCommandInteraction
  ) => {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guildId!;
      let userDoc = await UserLevel.findOne({ userId, guildId });
      if (!userDoc)
        userDoc = await UserLevel.create({
          userId,
          guildId,
          xp: 0,
          level: 0,
          lastMessageXp: null,
        });
      const currentXp = userDoc.xp;
      const currentLevel = userDoc.level;
      const xpNeeded = getXpUntilNextLevel(currentXp, currentLevel);
      const progressBar = getProgressBar(currentXp, currentLevel);
      const embed = new EmbedBuilder()
        .setTitle(`📊 ${interaction.user.displayName}'s Rank`)
        .setColor(0x3498db)
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: 'Level', value: `**${currentLevel}**`, inline: true },
          { name: 'Total XP', value: `**${currentXp}**`, inline: true },
          {
            name: `XP to Level ${currentLevel + 1}`,
            value: `**${xpNeeded} XP**`,
            inline: false,
          },
          {
            name: 'Progress',
            value: `\`${progressBar}\` (${currentXp - getXpForLevel(currentLevel)}/${getXpForLevel(currentLevel + 1) - getXpForLevel(currentLevel)} XP)`,
            inline: false,
          }
        )
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(`Error executing rank command: ${error}`);
      await interaction.reply({
        content: '❗ An error occurred while executing the command.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
