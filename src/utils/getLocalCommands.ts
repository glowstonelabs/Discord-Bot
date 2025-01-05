import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { ApplicationCommandOptionType } from 'discord.js';
import getAllFiles from './getAllFiles.ts';

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
  category?: string;
  permissions?: string[];
  deleted?: boolean;
}

/**
 * Retrieves local commands from the specified directory, excluding those in the exceptions list.
 * @param {string[]} exceptions - List of command names to exclude.
 * @returns {Promise<Command[]>} - List of command objects.
 */
const getLocalCommands = async (exceptions: string[] = []): Promise<Command[]> => {
  const localCommands: Command[] = [];

  // Get all command categories
  const commandCategories = getAllFiles(path.join(__dirname, '..', 'commands'), true);

  for (const commandCategory of commandCategories) {
    // Get all command files in the category
    const commandFiles = getAllFiles(commandCategory);

    for (const commandFile of commandFiles) {
      const commandURL = pathToFileURL(commandFile).href;
      let commandObject: Command;

      try {
        // Dynamically import the command file
        const importedModule = await import(commandURL);
        commandObject = importedModule.default || importedModule;
      } catch (error) {
        console.error(`Failed to import ${commandFile}:`, error);
        continue;
      }

      // Validate command object
      if (!commandObject.name || !commandObject.description) {
        console.error(
          `Command file ${commandFile} is missing required properties. Imported object:`,
          commandObject,
        );
        continue;
      }

      // Skip commands in the exceptions list
      if (exceptions.includes(commandObject.name)) {
        continue;
      }

      localCommands.push(commandObject);
    }
  }

  return localCommands;
};

export default getLocalCommands;
