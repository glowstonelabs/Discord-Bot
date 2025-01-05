import { ApplicationCommandOptionType } from 'discord.js';

// Define types to match registerCommands.ts
interface CommandOption {
  name: string;
  description: string;
  type: ApplicationCommandOptionType;
  required?: boolean;
  choices?: Array<{ name: string; value: string | number }>;
}

interface Command {
  name: string;
  description: string;
  options?: CommandOption[];
  category?: string;
  permissions?: string[];
  deleted?: boolean;
}

/**
 * Compares two sets of choices to determine if they are different.
 * @param {Array<{ name: string; value: string | number }>} choices1 - The first set of choices.
 * @param {Array<{ name: string; value: string | number }>} choices2 - The second set of choices.
 * @returns {boolean} - True if the choices are different, false otherwise.
 */
function areChoicesDifferent(
  choices1: { name: string; value: string | number }[] = [],
  choices2: { name: string; value: string | number }[] = [],
): boolean {
  if (choices1.length !== choices2.length) {
    return true;
  }

  return choices1.some(
    (choice, index) =>
      choice.name !== choices2[index].name || choice.value !== choices2[index].value,
  );
}

/**
 * Cleans a description by removing emojis and special characters.
 * @param {string} description - The description to clean.
 * @returns {string} - The cleaned description.
 */
function cleanDescription(description: string): string {
  return description.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{Cf}\s]/gu, '');
}

/**
 * Compares two sets of options to determine if they are different.
 * @param {CommandOption[]} existingOptions - The existing options.
 * @param {CommandOption[]} localOptions - The local options.
 * @returns {boolean} - True if the options are different, false otherwise.
 */
function areOptionsDifferent(
  existingOptions: CommandOption[] = [],
  localOptions: CommandOption[] = [],
): boolean {
  if (existingOptions.length !== localOptions.length) {
    return true;
  }

  return localOptions.some((localOption) => {
    const existingOption = existingOptions.find((option) => option.name === localOption.name);

    if (!existingOption) {
      return true;
    }

    return (
      cleanDescription(localOption.description) !== cleanDescription(existingOption.description) ||
      localOption.type !== existingOption.type ||
      (localOption.required ?? false) !== (existingOption.required ?? false) ||
      areChoicesDifferent(localOption.choices, existingOption.choices)
    );
  });
}

/**
 * Compares two commands to determine if they are different.
 * @param {Command} existingCommand - The existing command.
 * @param {Command} localCommand - The local command.
 * @returns {boolean} - True if the commands are different, false otherwise.
 */
function areCommandsDifferent(existingCommand: Command, localCommand: Command): boolean {
  // Compare names
  if (existingCommand.name !== localCommand.name) {
    return true;
  }

  // Compare descriptions
  if (
    cleanDescription(existingCommand.description) !== cleanDescription(localCommand.description)
  ) {
    return true;
  }

  // Compare options
  return areOptionsDifferent(existingCommand.options, localCommand.options);
}

export default areCommandsDifferent;
