import { Client } from 'discord.js';
import { maybeSpawnXpDrop } from '../messageCreate/handleXpDrop';

/**
 * Logs the status of the client user and starts the XP drop timer.
 * @param {Client} client - The Discord client.
 */
export default (client: Client) => {
  try {
    if (client.user) {
      console.log(`${client.user.tag} is online.`);
    } else {
      console.log('Client user is not available.');
    }
    // Start XP drop timer
    setInterval(() => {
      maybeSpawnXpDrop(client);
    }, 30 * 1000);
  } catch (error) {
    console.error('An error occurred while logging the client status:', error);
  }
};
