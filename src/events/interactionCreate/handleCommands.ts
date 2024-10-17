import { config as _config } from 'https://deno.land/x/dotenv/mod.ts';
import getLocalCommands from '../../utils/getLocalCommands.ts';
import { Client, Interaction, PermissionsBitField } from 'discord.js';

interface Command {
  name: string;
  devOnly?: boolean;
  testOnly?: boolean;
  permissionsRequired?: PermissionsBitField[];
  botPermissions?: PermissionsBitField[];
  execute: (client: Client, interaction: Interaction) => Promise<void>;
}

const testServer = Deno.env.get('TESTSERVER');
const devs = Deno.env.get('DEVS')?.split(',') || [];
const localCommands: Command[] = (await getLocalCommands()) as Command[];

/**
 * Handles command interactions.
 * @param {Client} client - The Discord client.
 * @param {Interaction} interaction - The interaction object.
 */
export default async (client: Client, interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const commandObject = localCommands.find((cmd) => cmd.name === interaction.commandName);

    if (!commandObject) return;

    if (commandObject.devOnly) {
      if (
        !interaction.member ||
        !('id' in interaction.member) ||
        !devs.includes(interaction.member.id)
      ) {
        interaction.reply({
          content: 'Only developers are allowed to run this command.',
          ephemeral: true,
        });
        return;
      }
    }

    if (commandObject.testOnly) {
      if (!interaction.guild || interaction.guild.id !== testServer) {
        interaction.reply({
          content: 'This command cannot be ran here.',
          ephemeral: true,
        });
        return;
      }
    }

    // Execute the command
    await commandObject.execute(client, interaction);
  } catch (error) {
    console.error(`Failed to handle command: ${error}`);
    interaction.reply({
      content: 'There was an error while executing this command.',
      ephemeral: true,
    });
  }
};
