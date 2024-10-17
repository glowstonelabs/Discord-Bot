import { Client } from 'discord.js';

/**
 * Logs the status of the client user.
 * @param {Client} client - The Discord client.
 */
export default (client: Client) => {
  try {
    if (client.user) {
      console.log(`${client.user.tag} is online.`);
    } else {
      console.log('Client user is not available.');
    }
  } catch (error) {
    console.error('An error occurred while logging the client status:', error);
  }
};
