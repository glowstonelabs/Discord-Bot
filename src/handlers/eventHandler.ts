import * as path from "https://deno.land/std/path/mod.ts";
import getAllFiles from "../utils/getAllFiles.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";

// Define types for client and event function arguments
interface Client {
  on: (eventName: string, handler: (arg: unknown) => Promise<void>) => void;
}

export default (client: Client, baseDir: string) => {
  const eventsDir = path.join(baseDir, "events");

  if (!existsSync(eventsDir)) {
    console.error(`Directory does not exist: ${eventsDir}`);
    return;
  }

  const eventFolders = getAllFiles(eventsDir, true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => (a > b ? 1 : -1));

    const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

    if (eventName) {
      client.on(eventName, async (arg) => {
        for (const eventFile of eventFiles) {
          try {
            const eventFileUrl = path.toFileUrl(eventFile).href;
            const eventFunction = await import(eventFileUrl);
            if (eventFunction && typeof eventFunction.default === "function") {
              await eventFunction.default(client, arg);
            } else {
              console.error(`Default export is not a function in ${eventFile}`);
            }
          } catch (error) {
            console.error(`Failed to import or execute ${eventFile}:`, error);
          }
        }
      });
    }
  }
};
