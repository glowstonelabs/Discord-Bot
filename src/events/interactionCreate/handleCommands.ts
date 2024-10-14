import { config as _config } from "https://deno.land/x/dotenv/mod.ts";
import getLocalCommands from "../../utils/getLocalCommands.ts"; // Changed require to import
const testServer = Deno.env.get("TESTSERVER");
const devs = Deno.env.get("DEVS")?.split(",") || [];

import { Client, Interaction } from "discord.js";

export default async (client: Client, interaction: Interaction) => {
  // Changed module.exports to export default
  if (!interaction.isChatInputCommand()) return;

  const localCommands = await getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.name === interaction.commandName
    );

    if (!commandObject) return;

    if (commandObject.devOnly) {
      if (!devs.includes(interaction.member.id)) {
        interaction.reply({
          content: "Only developers are allowed to run this command.",
          ephemeral: true,
        });
        return;
      }
    }

    if (commandObject.testOnly) {
      if (!interaction.guild || interaction.guild.id !== testServer) {
        interaction.reply({
          content: "This command cannot be ran here.",
          ephemeral: true,
        });
        return;
      }
    }

    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
        if (!interaction.member.permissions.has(permission)) {
          interaction.reply({
            content: "Not enough permissions.",
            ephemeral: true,
          });
          return;
        }
      }
    }

    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        const bot = interaction.guild?.members.me;
        if (!bot) {
          interaction.reply({
            content: "Bot does not have enough permissions.",
            ephemeral: true,
          });
          return;
        }

        if (!bot.permissions.has(permission)) {
          interaction.reply({
            content: "Bot does not have enough permissions.",
            ephemeral: true,
          });
          return;
        }
      }
    }

    // Execute the command
    await commandObject.execute(client, interaction);
  } catch (error) {
    console.error(error);
    interaction.reply({
      content: "An error occurred while executing the command.",
      ephemeral: true,
    });
  }
};
