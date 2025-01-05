import 'dotenv/config';
import {
  Client,
  ApplicationCommandOptionType,
  ApplicationCommand as DiscordApplicationCommand,
} from 'discord.js';
import getLocalCommands from '../../utils/getLocalCommands.ts';
import getApplicationCommands from '../../utils/getApplicationCommands.ts';
import areCommandsDifferent from '../../utils/areCommandsDifferent.ts';

// Define types to match utility files
interface CommandOption {
  name: string;
  description: string;
  type: ApplicationCommandOptionType;
  required?: boolean;
  choices?: Array<{ name: string; value: string | number }>;
}

interface Command {
  name: string;
  description: string;
  options?: CommandOption[];
  category?: string;
  permissions?: string[];
  deleted?: boolean;
  id?: string;
}

// Type guard to check if a command has an ID
function isCommandWithId(cmd: Command | undefined): cmd is Command & { id: string } {
  return cmd !== undefined && typeof cmd.id === 'string' && cmd.id.trim() !== '';
}

// Enhanced error logging utility
function logCommandError(action: string, command: Command, error?: unknown): void {
  console.error(`Error during ${action} for command "${command.name}":`, error);
}

/**
 * Registers and updates Discord slash commands
 * @param client - The Discord client instance
 */
export default async (client: Client): Promise<void> => {
  try {
    // Validate client application
    if (!client.application) {
      throw new Error('Client application is not initialized');
    }

    // Get local and application commands
    const localCommands = await getLocalCommands();
    const applicationCommands = await getApplicationCommands(client);

    // Process each local command
    for (const localCommand of localCommands) {
      const { name, description, options, deleted } = localCommand;

      try {
        // Skip deleted commands
        if (deleted) {
          const existingCommand = applicationCommands.cache.find(
            //@ts-ignore
            (cmd: Command) => cmd.name === name,
          );
          //@ts-ignore
          if (isCommandWithId(existingCommand)) {
            try {
              await applicationCommands.delete(existingCommand.id);
            } catch (deleteError) {
              logCommandError('deletion', existingCommand, deleteError);
            }
          }
          continue;
        }

        // Find existing command
        //@ts-ignore
        const existingCommand = applicationCommands.cache.find((cmd: Command) => cmd.name === name);

        // Update or create command
        //@ts-ignore
        if (isCommandWithId(existingCommand)) {
          // Check if command needs updating
          if (areCommandsDifferent(existingCommand, localCommand)) {
            try {
              await applicationCommands.edit(existingCommand.id, {
                name,
                description,
                //@ts-ignore
                options,
              });
            } catch (editError) {
              logCommandError('editing', existingCommand, editError);
            }
          }
        } else {
          // Create new command
          try {
            await applicationCommands.create({
              name,
              description,
              //@ts-ignore
              options,
            });
          } catch (createError) {
            logCommandError('creation', localCommand, createError);
          }
        }
      } catch (commandProcessingError) {
        console.error(`Failed to process command "${name}":`, commandProcessingError);
      }
    }
  } catch (globalError) {
    console.error('Fatal error during command registration:', globalError);

    // Optionally exit the process or implement retry logic
    if (globalError instanceof Error) {
      console.error(`Error details: ${globalError.message}`);
      console.error(`Stack trace: ${globalError.stack}`);
      process.exit(1);
    }
  }
};
