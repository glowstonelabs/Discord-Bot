import { ApplicationCommandManager, Client, GuildApplicationCommandManager } from 'discord.js';

/**
 * Retrieves application commands for the specified guild or globally.
 * @param {Client} client - The Discord client.
 * @param {string} [guildId] - The ID of the guild to retrieve commands for.
 * @returns {Promise<ApplicationCommandManager | GuildApplicationCommandManager>} - The application commands manager.
 * @throws {Error} - If the client application is null.
 */
const getApplicationCommands = async (
  client: Client,
  guildId?: string,
): Promise<ApplicationCommandManager | GuildApplicationCommandManager> => {
  let applicationCommands;

  if (guildId) {
    const guild = await client.guilds.fetch(guildId);
    applicationCommands = guild.commands;
  } else {
    if (client.application) {
      applicationCommands = client.application.commands;
    } else {
      throw new Error('Client application is null');
    }
  }

  await applicationCommands.fetch({ withLocalizations: true });
  return applicationCommands;
};

export default getApplicationCommands;
