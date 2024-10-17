// @ts-ignore: Ignoring type errors for discord.js import
import { ActivityType, Client } from 'discord.js';

/**
 * Sets the bot's status at regular intervals.
 * @param {Client} client - The Discord client.
 */
const setStatus = (client: Client) => {
  const status = [
    {
      name: 'Fusion make me',
      type: ActivityType.Watching,
    },
    {
      name: 'People type',
      type: ActivityType.Watching,
    },
    {
      name: '/help',
      type: ActivityType.Watching,
    },
    {
      name: 'Fusion code',
      type: ActivityType.Watching,
    },
    {
      name: 'Fusion push updates',
      type: ActivityType.Watching,
    },
  ];

  setInterval(() => {
    try {
      const random = Math.floor(Math.random() * status.length);
      client.user?.setActivity(status[random].name, {
        type: status[random].type,
      });
    } catch (error) {
      console.error(error);
    }
  }, 10000);
};

export default setStatus;
