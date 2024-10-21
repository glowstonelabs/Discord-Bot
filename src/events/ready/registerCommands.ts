import { config as _config } from 'https://deno.land/x/dotenv/mod.ts';
import areCommandsDifferent from '../../utils/areCommandsDifferent.ts';
import getApplicationCommands from '../../utils/getApplicationCommands.ts';
import getLocalCommands from '../../utils/getLocalCommands.ts';
import {
  ApplicationCommand,
  ApplicationCommandOptionChoiceData,
  ApplicationCommandOptionData,
  ApplicationCommandSubGroupData,
  Client,
} from 'discord.js';
import { ApplicationCommandOptionType } from 'https://deno.land/x/discord_api_types/v10.ts';

interface Command {
  name: string;
  description: string;
  options?: Option[];
  deleted?: boolean;
}

type Option = (ApplicationCommandOptionData | ApplicationCommandSubGroupData) & {
  choices?: ApplicationCommandOptionChoiceData<string | number>[];
  type: ApplicationCommandOptionType;
};

const testServer = Deno.env.get('TESTSERVER');

/**
 * Registers or updates commands for the Discord bot.
 * @param {Client} client - The Discord client.
 */
async function registerCommands(client: Client) {
  try {
    const localCommands = await getLocalCommands();
    const applicationCommands = await getApplicationCommands(client, testServer);

    for (const localCommand of localCommands) {
      const { name, description, options = [], deleted } = localCommand as Command;

      const existingCommand = applicationCommands.cache.find(
        (cmd: ApplicationCommand) => cmd.name === name,
      );

      if (existingCommand) {
        if (deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`🗑 Deleted command "${name}".`);
          continue;
        }

        if (
          // @ts-ignore - TS doesn't like the type of existingCommand
          areCommandsDifferent(existingCommand as Command, {
            description,
            options: options.map((option) => ({
              ...(typeof option === 'object' ? option : {}),
              choices:
                'choices' in option
                  ? // @ts-ignore - TS doesn't like the type of existingCommand
                    [...((option as Option).choices ?? [])]
                  : undefined,
            })),
          })
        ) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          console.log(`🔁 Edited command "${name}".`);
        }
      } else {
        if (deleted) {
          console.log(`⏩ Skipping registering command "${name}" as it's set to delete.`);
          continue;
        }

        await applicationCommands.create({
          name,
          description,
          options,
        });

        console.log(`👍 Registered command "${name}".`);
      }
    }
  } catch (error) {
    console.error(`There was an error: ${error}`);
  }
}

export default registerCommands;
