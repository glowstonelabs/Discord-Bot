// src/events/ready/registerCommands.ts
import 'dotenv/config';
import {
  Client,
  ApplicationCommand,
  ApplicationCommandOptionType,
  // @ts-ignore
  ApplicationCommandOptionData,
  // @ts-ignore
  ApplicationCommandSubGroupData,
  // @ts-ignore
  ApplicationCommandOptionChoiceData,
} from 'discord.js';
import getLocalCommands from '../../utils/getLocalCommands.ts';
import getApplicationCommands from '../../utils/getApplicationCommands.ts';
import areCommandsDifferent from '../../utils/areCommandsDifferent.ts';

// Refined type definitions
type Option = (ApplicationCommandOptionData | ApplicationCommandSubGroupData) & {
  choices?: ApplicationCommandOptionChoiceData<string | number>[];
  type: ApplicationCommandOptionType;
};

interface Command {
  name: string;
  description: string;
  options?: Option[];
  deleted?: boolean;
}

/**
 * Comprehensive slash command registration process
 * @param client - The Discord client
 */
export default async (client: Client): Promise<void> => {
  try {
    // Get test server from environment variables
    const testServer = process.env.TESTSERVER;

    // Retrieve application commands and local commands
    const applicationCommands = await getApplicationCommands(client, testServer);
    const localCommands = await getLocalCommands();

    // Fetch existing commands
    // @ts-ignore
    const existingCommands = await applicationCommands.fetch();

    // Create sets for tracking
    const localCommandNames = new Set(localCommands.map((cmd) => cmd.name));
    const processedCommandNames = new Set<string>();

    // First pass: Remove obsolete commands
    for (const [, existingCommand] of existingCommands) {
      // If the existing command is not in local commands, delete it
      if (!localCommandNames.has(existingCommand.name)) {
        await applicationCommands.delete(existingCommand.id);
        console.log(`🗑 Deleted obsolete command: "${existingCommand.name}"`);
      }
    }

    // Second pass: Register or update commands
    for (const localCommand of localCommands) {
      const { name, description, options = [], deleted } = localCommand as Command;

      // Skip if already processed or marked for deletion
      if (processedCommandNames.has(name) || deleted) {
        if (deleted) {
          console.log(`⏩ Skipping deleted command "${name}"`);
        } else {
          console.warn(`⚠️ Duplicate command name detected: "${name}". Skipping.`);
        }
        continue;
      }

      // Find existing command
      const existingCommand = existingCommands.find((cmd) => cmd.name === name);

      // Prepare command data
      const commandData = {
        name,
        description,
        options: options.length > 0 ? options : undefined,
      };

      try {
        if (existingCommand) {
          // Check if command needs updating
          const commandDifference = areCommandsDifferent(
            {
              name: existingCommand.name,
              description: existingCommand.description,
              options: existingCommand.options as Option[] | undefined,
            },
            commandData,
          );

          // Update only if there are differences
          if (commandDifference) {
            await applicationCommands.edit(existingCommand.id, commandData);
            console.log(`🔁 Updated command: "${name}"`);
          } else {
            console.log(`✅ Command "${name}" is up to date`);
          }
        } else if (!deleted) {
          // Create new command only if not deleted
          await applicationCommands.create(commandData);
          console.log(`👍 Registered new command: "${name}"`);
        }

        // Mark command as processed
        processedCommandNames.add(name);
      } catch (error) {
        console.error(`❌ Error processing command "${name}":`, error);
      }
    }

    console.log('✨ Command registration process completed.');
    console.log(`📊 Total commands processed: ${processedCommandNames.size}`);
  } catch (error) {
    console.error(`❌ Fatal error during command registration:`, error);

    // Detailed error logging
    if (error instanceof Error) {
      console.error(`Error details: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);
    }
  }
};
