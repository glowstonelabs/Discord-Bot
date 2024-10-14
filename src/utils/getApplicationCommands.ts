import { Client } from "discord.js";

const getApplicationCommands = async (client: Client, guildId?: string) => {
  let applicationCommands;

  if (guildId) {
    const guild = await client.guilds.fetch(guildId);
    applicationCommands = guild.commands;
  } else {
    if (client.application) {
      applicationCommands = await client.application.commands;
    } else {
      throw new Error("Client application is null");
    }
  }

  await applicationCommands.fetch({ withLocalizations: true });
  return applicationCommands;
};

export default getApplicationCommands;
