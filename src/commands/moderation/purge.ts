import {
  // @ts-ignore: Ignoring type errors for application command option type
  ApplicationCommandOptionType,
  Client,
  CommandInteraction,
  EmbedBuilder,
  NewsChannel,
  // @ts-ignore: Ignoring type errors for permission flags bits
  PermissionFlagsBits,
  TextChannel,
  ThreadChannel,
} from "discord.js";

export default {
  name: "purge",
  description: "🧹 Deletes a specified number of messages from the channel.",
  options: [
    {
      name: "amount",
      description: "The number of messages to delete (1-100) 🗑️",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],

  execute: async (_client: Client, interaction: CommandInteraction) => {
    // @ts-ignore: Ignoring type errors for amount
    const amount = interaction.options.getInteger("amount");
    const channel = interaction.channel;

    if (!channel) {
      await interaction.reply({
        content: "❌ Unable to access the channel.",
        ephemeral: true,
      });
      return;
    }

    if (!amount) {
      await interaction.reply({
        content: "❌ Please specify the number of messages you want to delete.",
        ephemeral: true,
      });
      return;
    }

    if (amount > 100) {
      await interaction.reply({
        content: "⚠️ You cannot delete more than 100 messages!",
        ephemeral: true,
      });
      return;
    }

    if (amount < 1) {
      await interaction.reply({
        content: "⚠️ You must delete at least 1 message!",
        ephemeral: true,
      });
      return;
    }

    try {
      if (
        channel instanceof TextChannel ||
        channel instanceof NewsChannel ||
        channel instanceof ThreadChannel
      ) {
        const messages = await channel.bulkDelete(amount, true);
        const embed = new EmbedBuilder()
          .setColor("#00FF00")
          // @ts-ignore: Ignoring type errors for title
          .setTitle("Purge Successful 🧹")
          .setDescription(`Successfully deleted ${messages.size} messages.`)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({
          content: "❌ This command can only be used in text-based channels.",
          ephemeral: true,
        });
        return;
      }
    } catch (error) {
      await interaction.reply({
        content: `❌ An error occurred while trying to delete messages: ${
          (error as Error).message
        }`,
        ephemeral: true,
      });
    }
  },
};
