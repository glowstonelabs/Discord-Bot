import {
  // @ts-ignore - no
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  // @ts-ignore - no
  PermissionFlagsBits,
  TextChannel,
} from 'discord.js';

export default {
  name: 'purge',
  description: '🧹 Deletes a specified number of messages from the channel.',
  options: [
    {
      name: 'amount',
      description: 'The number of messages to delete (1-100) 🧹',
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],

  /**
   * Execute method to handle the purge command
   * @param {Client} client - The Discord client
   * @param {CommandInteraction} interaction - The interaction object
   */
  execute: async (_client: Client, interaction: CommandInteraction) => {
    // @ts-ignore - no
    const channel = interaction.channel as TextChannel;
    // @ts-ignore - no
    const amount = interaction.options.getInteger('amount');

    if (!channel) {
      await interaction.reply({
        content: '❌ Unable to access the channel.',
        ephemeral: true,
      });
      return;
    }

    if (amount === null) {
      await interaction.reply({
        content: '❌ Please specify the number of messages you want to delete.',
        ephemeral: true,
      });
      return;
    }

    if (amount > 100) {
      await interaction.reply({
        content: '⚠️ You cannot delete more than 100 messages!',
        ephemeral: true,
      });
      return;
    }

    if (amount < 1) {
      await interaction.reply({
        content: '⚠️ You must delete at least 1 message!',
        ephemeral: true,
      });
      return;
    }

    try {
      const messages = await channel.messages.fetch({ limit: amount });
      await channel.bulkDelete(messages);

      await interaction.reply({
        content: `🧹 Successfully deleted ${amount} messages.`,
        ephemeral: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await interaction.reply({
        content: `❌ An error occurred while trying to delete messages: ${errorMessage}`,
        ephemeral: true,
      });
    }
  },
};
