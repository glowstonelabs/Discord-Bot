import {
  ButtonInteraction as _ButtonInteraction,
  Client,
  EmbedBuilder,
  // @ts-ignore
  Interaction,
} from 'discord.js';
import Poll from '../../models/pollSchema.ts';

const handlePolls = async (_client: Client, interaction: Interaction) => {
  if (!interaction.isButton()) return;

  // Verify this is a poll interaction
  if (!interaction.customId.startsWith('option')) return;

  const userId = interaction.user.id;
  const pollMessageId = interaction.message.id;

  // Improve option parsing
  const optionStr = interaction.customId.split('_')[1];
  const optionIndex = Number(optionStr);

  // Validate option index
  if (isNaN(optionIndex)) {
    console.error(`Invalid option index: ${optionStr}`);
    return;
  }

  // Find poll data
  const pollData = await Poll.findOne({ messageId: pollMessageId });

  if (!pollData) {
    console.log('No poll data found for message:', pollMessageId);
    return;
  }

  // Validate option exists
  if (optionIndex < 0 || optionIndex >= pollData.votes.length) {
    console.error(`Option index out of range: ${optionIndex}`);
    return;
  }

  // Check if user has already voted
  const existingVoteIndex = pollData.userVotes.findIndex(
    (vote) => vote.userId === userId
  );

  if (existingVoteIndex >= 0) {
    // Remove vote from previous option
    const oldOptionIndex = pollData.userVotes[existingVoteIndex].optionIndex;
    pollData.votes[oldOptionIndex] = Math.max(
      0,
      pollData.votes[oldOptionIndex] - 1
    );

    // Update to new option
    pollData.userVotes[existingVoteIndex].optionIndex = optionIndex;
  } else {
    // Add new vote
    pollData.userVotes.push({ userId, optionIndex });
  }

  // Update vote count
  pollData.votes[optionIndex] += 1;

  try {
    await pollData.save();
  } catch (error) {
    console.error('Failed to save poll:', error);
    return;
  }

  const pollEmbed = interaction.message.embeds[0];
  const updatedDescription =
    pollEmbed.description!.split('\n\n')[0] +
    '\n\n' +
    pollData.votes
      .map(
        (count: number, index: number) => `Option ${index + 1}: ${count} votes`
      )
      .join('\n');
  // @ts-ignore stfu
  const updatedEmbed =
    EmbedBuilder.from(pollEmbed).setDescription(updatedDescription);

  await interaction.update({ embeds: [updatedEmbed] });
};

export default handlePolls;
