import 'dotenv/config';
import getLocalCommands from '../../utils/getLocalCommands.ts';
//@ts-ignore
import { Client, Interaction, MessageFlags, PermissionsBitField } from 'discord.js';

interface Command {
  name: string;
  devOnly?: boolean;
  testOnly?: boolean;
  permissionsRequired?: PermissionsBitField[];
  botPermissions?: PermissionsBitField[];
  execute: (client: Client, interaction: Interaction) => Promise<void>;
}

const testServer = process.env.TESTSERVER;
const devs = process.env.DEVS?.split(',') || [];
//@ts-ignore
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
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    if (commandObject.testOnly) {
      if (!interaction.guild || interaction.guild.id !== testServer) {
        interaction.reply({
          content: 'This command cannot be ran here.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    // Rest of the existing code...
    await commandObject.execute(client, interaction);
  } catch (error) {
    console.error('Error executing command:', error);
  }
};
