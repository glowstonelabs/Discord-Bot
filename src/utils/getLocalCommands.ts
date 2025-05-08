// src/utils/getLocalCommands.ts
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { ApplicationCommandOptionType } from 'discord.js';
import getAllFiles from './getAllFiles.ts';
import fs from 'fs/promises';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define types to match registerCommands.ts
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
  deleted?: boolean;
}

/**
 * Retrieves local commands from the specified directory
 * @param exceptions - List of command names to exclude
 * @returns List of command objects
 */
const getLocalCommands = async (
  exceptions: string[] = []
): Promise<Command[]> => {
  const localCommands: Command[] = [];
  const processedCommandNames = new Set<string>();

  // Get all command categories
  const commandCategories = getAllFiles(
    path.join(__dirname, '..', 'commands'),
    true
  );

  for (const commandCategory of commandCategories) {
    // Get all command files in the category
    const commandFiles = getAllFiles(commandCategory);

    for (const commandFile of commandFiles) {
      try {
        // Check if file still exists
        await fs.access(commandFile);

        // Dynamically import the command file
        const commandURL = pathToFileURL(commandFile).href;
        const importedModule = await import(commandURL);
        const commandObject = importedModule.default || importedModule;

        // Validate command object
        if (!commandObject.name || !commandObject.description) {
          console.error(
            `Command file ${commandFile} is missing required properties. Imported object:`,
            commandObject
          );
          continue;
        }

        // Skip commands in the exceptions list
        if (exceptions.includes(commandObject.name)) {
          continue;
        }

        // Prevent duplicate command names
        if (processedCommandNames.has(commandObject.name)) {
          console.warn(
            `Duplicate command name detected: "${commandObject.name}". Skipping.`
          );
          continue;
        }

        // Always add the command, even if it's marked for deletion
        localCommands.push(commandObject);
        processedCommandNames.add(commandObject.name);
      } catch (error) {
        // If file doesn't exist or can't be imported, mark as deleted
        console.warn(
          `Command file ${commandFile} not found or could not be imported.`
        );

        // Extract command name from filename
        const commandName = path.basename(
          commandFile,
          path.extname(commandFile)
        );

        const deletedCommand: Command = {
          name: commandName,
          description: `Deleted command: ${commandName}`,
          deleted: true,
        };

        // Check for duplicate deleted command names
        if (!processedCommandNames.has(commandName)) {
          localCommands.push(deletedCommand);
          processedCommandNames.add(commandName);
        }
      }
    }
  }

  return localCommands;
};

export default getLocalCommands;
