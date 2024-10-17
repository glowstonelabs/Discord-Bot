import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import getAllFiles from './getAllFiles.ts';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Retrieves local commands from the specified directory, excluding those in the exceptions list.
 * @param {string[]} exceptions - List of command names to exclude.
 * @returns {Promise<object[]>} - List of command objects.
 */
const getLocalCommands = async (exceptions: string[] = []): Promise<object[]> => {
  const localCommands = [];

  // Get all command categories
  const commandCategories = getAllFiles(path.join(__dirname, '..', 'commands'), true);

  for (const commandCategory of commandCategories) {
    // Get all command files in the category
    const commandFiles = getAllFiles(commandCategory);

    for (const commandFile of commandFiles) {
      const commandURL = pathToFileURL(commandFile).href;
      let commandObject;

      try {
        // Dynamically import the command file
        commandObject = await import(commandURL);
      } catch (error) {
        console.error(`Failed to import ${commandFile}:`, error);
        continue;
      }

      // Check if the default export is used
      if (commandObject.default) {
        commandObject = commandObject.default;
      }

      // Ensure the command has a name property
      if (!commandObject.name) {
        console.error(
          `Command file ${commandFile} is missing a name property. Imported object:`,
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
