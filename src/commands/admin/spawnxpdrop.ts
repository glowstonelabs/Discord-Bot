import {
  Client,
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionsBitField,
} from 'discord.js';
import {
  XP_DROP_CHANNEL_ID,
  MIN_XP_DROP,
  MAX_XP_DROP,
  XP_MULTIPLIER_HAPPY_HOUR,
} from '../../config/levelConfig';
import { isHappyHour } from '../../utils/levelUtils';
import { sendXpDropMessage } from '../../events/messageCreate/handleXpDrop';

export default {
  name: 'spawnxpdrop',
  description: 'Manually spawns an XP drop in the configured channel.',
  options: [
    {
      name: 'amount',
      type: 4, // INTEGER type
      description:
        'Optional: The exact XP amount. If not specified, a random amount is used.',
      required: false,
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
      const amount = interaction.options.getInteger('amount');
      let xpToDrop =
        amount ??
        Math.floor(Math.random() * (MAX_XP_DROP - MIN_XP_DROP + 1)) +
          MIN_XP_DROP;
      if (xpToDrop < 0) {
        await interaction.reply({
          content: '❗ XP amount cannot be negative.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      if (isHappyHour()) xpToDrop *= XP_MULTIPLIER_HAPPY_HOUR;
      const channel = interaction.guild?.channels.cache.get(XP_DROP_CHANNEL_ID);
      if (!channel || channel.type !== 0) {
        await interaction.reply({
          content: `ERROR: XP Drop Channel (ID: ${XP_DROP_CHANNEL_ID}) not found or not a text channel.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      await sendXpDropMessage(channel, xpToDrop, interaction.user.id);
      await interaction.reply({
        content: `Spawning **${xpToDrop} XP**${isHappyHour() ? ' (doubled due to Happy Hour)' : ''} in <#${XP_DROP_CHANNEL_ID}>!`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(`Error executing spawnxpdrop command: ${error}`);
      await interaction.reply({
        content: '❗ An error occurred while executing the command.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
