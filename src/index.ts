import { Client, IntentsBitField } from "npm:discord.js";
// import mongoose from "npm:mongoose";
import eventHandler from "./handlers/eventHandler.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

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

    // mongoose.set("strictQuery", false);
    // await mongoose.connect(Deno.env.get("MONGODB_URI"));
    // console.log("Connected to DB.");

    const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
    eventHandler(client, __dirname);

    const token = Deno.env.get("TOKEN");
    if (!token) {
      throw new Error("Discord token is not set in environment variables");
    }

    await client.login(token);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();
