import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import getAllFiles from "./getAllFiles.ts";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getLocalCommands = async (exceptions: string[] = []) => {
  const localCommands = [];

  const commandCategories = getAllFiles(
    path.join(__dirname, "..", "commands"),
    true
  );

  for (const commandCategory of commandCategories) {
    const commandFiles = getAllFiles(commandCategory);

    for (const commandFile of commandFiles) {
      const commandURL = pathToFileURL(commandFile).href;
      let commandObject;

      try {
        commandObject = await import(commandURL);
      } catch (error) {
        console.error(`Failed to import ${commandFile}:`, error);
        continue;
      }

      // Check if the default export is used
      if (commandObject.default) {
        commandObject = commandObject.default;
      }

      if (!commandObject.name) {
        console.error(
          `Command file ${commandFile} is missing a name property. Imported object:`,
          commandObject
        );
        continue;
      }

      if (exceptions.includes(commandObject.name)) {
        continue;
      }

      localCommands.push(commandObject);
    }
  }

  return localCommands;
};

export default getLocalCommands;
