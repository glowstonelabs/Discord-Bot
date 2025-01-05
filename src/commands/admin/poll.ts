import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import Poll from '../../models/pollSchema.ts';

export default {
  name: 'poll',
  description: '📊 Creates a poll in the channel.',
  options: [
    {
      name: 'question',
      type: 3, // STRING type
      description: 'The question for the poll',
      required: true,
    },
    {
      name: 'option1',
      type: 3, // STRING type
      description: 'First option for the poll',
      required: true,
    },
    {
      name: 'option2',
      type: 3, // STRING type
      description: 'Second option for the poll',
      required: true,
    },
    {
      name: 'option3',
      type: 3, // STRING type
      description: 'Third option for the poll',
      required: false,
    },
    {
      name: 'option4',
      type: 3, // STRING type
      description: 'Fourth option for the poll',
      required: false,
    },
  ],
  execute: async (_client: Client, interaction: CommandInteraction) => {
    try {
      const question = (interaction.options as CommandInteractionOptionResolver).getString(
        'question',
        true,
      );
      const option1 = (interaction.options as CommandInteractionOptionResolver).getString(
        'option1',
        true,
      );
      const option2 = (interaction.options as CommandInteractionOptionResolver).getString(
        'option2',
        true,
      );
      const option3 = (interaction.options as CommandInteractionOptionResolver).getString(
        'option3',
      );
      const option4 = (interaction.options as CommandInteractionOptionResolver).getString(
        'option4',
      );
      const options = [option1, option2, option3, option4].filter(Boolean);

      const pollDescription = options
        .map((option, index) => `Option ${index + 1}: ${option}`)
        .join('\n');

      const pollEmbed = new EmbedBuilder()
        .setColor(0x3498db)
        // @ts-ignore stfu
        .setTitle('📊 Poll')
        .setDescription(`${question}\n\n${pollDescription}`)
        .setTimestamp()
        .setFooter({
          text: `Poll created by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      // @ts-ignore stfu
      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...options.map((_, index) =>
          new ButtonBuilder()
            // @ts-ignore stfu
            .setCustomId(`option_${index}`) // Consistent format: option_0, option_1, etc.
            .setLabel(`Option ${index + 1}`) // Labels: Option 1, Option 2, etc.
            .setStyle(ButtonStyle.Primary),
        ),
      );

      const pollMessage = await interaction.reply({
        embeds: [pollEmbed],
        components: [actionRow],
        withResponse: true,
      });

      // Save poll data to MongoDB
      const pollData = new Poll({
        messageId: pollMessage.resource?.message?.channel.id,
        options,
        votes: new Array(options.length).fill(0),
        userVotes: [],
      });
      await pollData.save();
    } catch (error) {
      console.error(`Error executing poll command: ${error}`);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❗ An error occurred while executing the command.',
          flags: MessageFlags.Ephemeral,
        });
      } else if (interaction.deferred) {
        await interaction.editReply({
          content: '❗ An error occurred while executing the command.',
        });
      } else {
        await interaction.followUp({
          content: '❗ An error occurred while executing the command.',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
