import * as path from 'path';
import * as fs from 'fs';
import { Client } from 'discord.js';
import getAllFiles from '../utils/getAllFiles.ts';

// Define a generic event function type
type EventFunction = (client: Client, ...args: any[]) => Promise<void> | void;

/**
 * Loads and registers event handlers for the Discord bot
 * @param client - The Discord client instance
 * @param baseDir - Base directory containing events
 */
export default async (client: Client, baseDir: string): Promise<void> => {
  try {
    const normalizedBaseDir = path.resolve(baseDir);
    const eventsDir = path.join(normalizedBaseDir, 'events');

    if (!fs.existsSync(eventsDir)) {
      const altEventsDirs = [
        path.join(process.cwd(), 'src', 'events'),
        path.join(__dirname, '..', 'events'),
        path.join(normalizedBaseDir, '..', 'events'),
      ];

      const existingAltDir = altEventsDirs.find((dir) => fs.existsSync(dir));

      if (!existingAltDir) {
        console.warn('No valid events directory found');
        return;
      }

      const eventCategories = getAllFiles(existingAltDir, true);

      for (const categoryPath of eventCategories) {
        const category = path.basename(categoryPath);
        const eventFiles = getAllFiles(categoryPath).filter((file) => file.endsWith('.ts'));

        for (const eventFile of eventFiles) {
          try {
            const eventModule = await import(`file://${eventFile}`);
            const eventHandler: EventFunction = eventModule.default;

            if (typeof eventHandler === 'function') {
              const eventName = category === 'ready' ? 'ready' : category;

              client.on(eventName, async (...args) => {
                try {
                  await eventHandler(client, ...args);
                } catch (handlerError) {
                  console.error(`Error in event handler ${eventName}:`, handlerError);
                }
              });
            }
          } catch (importError) {
            console.error(`Error importing event file ${eventFile}:`, importError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error during event handler registration:', error);
  }
};
