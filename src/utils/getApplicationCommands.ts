// src/utils/getApplicationCommands.ts
import { Client } from 'discord.js';

/**
 * Retrieves application commands for a given client
 * @param client - The Discord client
 * @param testServer - Optional test server ID
 * @returns Application commands
 */
export default async function getApplicationCommands(client: Client, testServer?: string) {
  // Validate client application
  if (!client.application) {
    throw new Error('Client application is not initialized');
  }

  // Retrieve commands for global or guild scope
  if (testServer) {
    const guild = client.guilds.cache.get(testServer);
    if (!guild) {
      throw new Error(`Test server with ID ${testServer} not found`);
    }
    return guild.commands;
  }

  // Return global application commands
  return client.application.commands;
}
