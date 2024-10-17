import { Client, IntentsBitField } from 'npm:discord.js';
// import mongoose from "npm:mongoose";
import eventHandler from './handlers/eventHandler.ts';
import * as path from 'https://deno.land/std/path/mod.ts';
import { config } from 'https://deno.land/x/dotenv/mod.ts';

// Initialize the Discord client with necessary intents
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
  ],
});

(async () => {
  try {
    // Load environment variables from .env file
    config({ export: true });

    // Uncomment and configure mongoose if using MongoDB
    // mongoose.set("strictQuery", false);
    // await mongoose.connect(Deno.env.get("MONGODB_URI"));
    // console.log("Connected to DB.");

    // Get the directory name of the current module
    const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

    // Handle events
    eventHandler(client, __dirname);

    // Get the Discord token from environment variables
    const token = Deno.env.get('TOKEN');
    if (!token) {
      throw new Error('Discord token is not set in environment variables');
    }

    // Log in to Discord
    await client.login(token);
    console.log('Bot logged in successfully.');
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred');
    }
  }
})();
