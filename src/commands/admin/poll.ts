import {
  ActionRowBuilder,
  ButtonBuilder,
  // @ts-ignore stfu
  ButtonStyle,
  Client,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
} from 'npm:discord.js';
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
        new ButtonBuilder()
          // @ts-ignore stfu
          .setCustomId('option1')
          .setLabel('Option 1')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          // @ts-ignore stfu
          .setCustomId('option2')
          .setLabel('Option 2')
          .setStyle(ButtonStyle.Primary),
        ...(option3
          ? [
              // @ts-ignore stfu
              new ButtonBuilder()
                // @ts-ignore stfu
                .setCustomId('option3')
                .setLabel('Option 3')
                .setStyle(ButtonStyle.Primary),
            ]
          : []),
        ...(option4
          ? [
              new ButtonBuilder()
                // @ts-ignore stfu
                .setCustomId('option4')
                .setLabel('Option 4')
                .setStyle(ButtonStyle.Primary),
            ]
          : []),
      );

      const pollMessage = await interaction.reply({
        embeds: [pollEmbed],
        components: [actionRow],
        fetchReply: true,
      });

      // Save poll data to MongoDB
      const pollData = new Poll({
        messageId: pollMessage.id,
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
          ephemeral: true,
        });
      } else if (interaction.deferred) {
        await interaction.editReply({
          content: '❗ An error occurred while executing the command.',
        });
      } else {
        await interaction.followUp({
          content: '❗ An error occurred while executing the command.',
          ephemeral: true,
        });
      }
    }
  },
};
