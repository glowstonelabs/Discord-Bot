import {
  Client,
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionsBitField,
} from 'discord.js';
import UserLevel from '../../models/userLevelSchema';
import { getXpForLevel, updateLevelRoles } from '../../utils/levelUtils';

export default {
  name: 'setlevel',
  description: "Sets a user's level to a specific value (and adjusts XP).",
  options: [
    {
      name: 'user',
      type: 6, // USER type
      description: 'The user whose level you want to set.',
      required: true,
    },
    {
      name: 'level',
      type: 4, // INTEGER type
      description: 'The new target level.',
      required: true,
    },
  ],
  execute: async (
    _client: Client,
    interaction: ChatInputCommandInteraction
  ) => {
    try {
      if (
        !interaction.memberPermissions?.has(
          PermissionsBitField.Flags.ManageGuild
        )
      ) {
        await interaction.reply({
          content:
            '❗ You need the "Manage Server" permission to use this command.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const user = interaction.options.getUser('user');
      const level = interaction.options.getInteger('level');
      if (!user || level == null || level < 0) {
        await interaction.reply({
          content: '❗ Invalid user or level.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const guildId = interaction.guildId!;
      let userDoc = await UserLevel.findOne({ userId: user.id, guildId });
      if (!userDoc)
        userDoc = await UserLevel.create({
          userId: user.id,
          guildId,
          xp: 0,
          level: 0,
          lastMessageXp: null,
        });
      const oldXp = userDoc.xp;
      const oldLevel = userDoc.level;
      const targetXp = getXpForLevel(level);
      userDoc.xp = targetXp;
      userDoc.level = level;
      await userDoc.save();
      // Update roles
      const member = await interaction.guild?.members.fetch(user.id);
      if (member) await updateLevelRoles(member, userDoc.level);
      const embed = new EmbedBuilder()
        .setTitle('⬆️ Level Updated')
        .setDescription(`Set <@${user.id}>'s level to **${level}**.`)
        .addFields(
          {
            name: 'Old Status',
            value: `Level ${oldLevel} (${oldXp} XP)`,
            inline: true,
          },
          {
            name: 'New Status',
            value: `Level ${userDoc.level} (${userDoc.xp} XP)`,
            inline: true,
          }
        )
        .setColor(0x43b581)
        .setFooter({
          text: `Action by ${interaction.user.displayName}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(`Error executing setlevel command: ${error}`);
      await interaction.reply({
        content: '❗ An error occurred while executing the command.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
