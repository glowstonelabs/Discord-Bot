import { Client, Interaction, EmbedBuilder } from 'npm:discord.js';
import Poll from '../../models/pollSchema.ts';

/**
 * Handles button interactions for polls.
 * @param {Client} client - The Discord client.
 * @param {Interaction} interaction - The interaction object.
 */
const handlePolls = async (client: Client, interaction: Interaction) => {
  if (!interaction.isButton()) return;

  const pollMessageId = interaction.message.id;
  const pollData = await Poll.findOne({ messageId: pollMessageId });

  if (!pollData) {
    console.log('No poll data found for message:', pollMessageId);
    return;
  }

  const userId = interaction.user.id;
  const optionIndex = parseInt(interaction.customId.replace('option', ''), 10) - 1;

  if (isNaN(optionIndex) || optionIndex < 0 || optionIndex >= pollData.votes.length) {
    console.log('Invalid option index:', optionIndex);
    return;
  }

  // Find the user's previous vote, if any
  const userVote = pollData.userVotes.find((vote) => vote.userId === userId);

  if (userVote) {
    // If the user has already voted, update their vote
    pollData.votes[userVote.optionIndex] -= 1;
    userVote.optionIndex = optionIndex;
  } else {
    // If the user has not voted yet, add their vote
    pollData.userVotes.push({ userId, optionIndex });
  }

  // Update the vote count
  pollData.votes[optionIndex] += 1;
  await pollData.save();

  const pollEmbed = interaction.message.embeds[0];
  const updatedDescription =
    pollEmbed.description!.split('\n\n')[0] +
    '\n\n' +
    pollData.votes.map((count, index) => `Option ${index + 1}: ${count} votes`).join('\n');

  const updatedEmbed = EmbedBuilder.from(pollEmbed).setDescription(updatedDescription);

  await interaction.update({ embeds: [updatedEmbed] });
};

export default handlePolls;
