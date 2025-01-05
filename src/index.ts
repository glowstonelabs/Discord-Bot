import { Client, IntentsBitField } from 'discord.js';
import mongoose from 'mongoose';
import eventHandler from './handlers/eventHandler.ts';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

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
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI is not set in environment variables');
    }
    // Log a generic message instead of the full URI
    console.log('MongoDB URI retrieved successfully.');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Get the directory name of the current module
    const __dirname = path.dirname(import.meta.url.replace('file://', ''));

    // Handle events
    eventHandler(client, __dirname);

    // Get the Discord token from environment variables
    const token = process.env.TOKEN;
    if (!token) {
      throw new Error('Discord token is not set in environment variables');
    }

    // Login to Discord
    await client.login(token);
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
})();
