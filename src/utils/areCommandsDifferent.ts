// src/utils/areCommandsDifferent.ts
import { ApplicationCommandOptionType } from 'discord.js';

interface CommandOption {
  name: string;
  description: string;
  type: ApplicationCommandOptionType;
  required?: boolean;
  choices?: Array<{ name: string; value: string | number }>;
}

interface Command {
  name?: string;
  description: string;
  options?: CommandOption[];
}

/**
 * Compare two sets of command options
 */
function areOptionsDifferent(
  existingOptions: CommandOption[] = [],
  localOptions: CommandOption[] = []
): boolean {
  // Different number of options
  if (existingOptions.length !== localOptions.length) {
    return true;
  }

  // Compare each option
  return localOptions.some((localOption, index) => {
    const existingOption = existingOptions[index];

    return (
      localOption.name !== existingOption.name ||
      localOption.description !== existingOption.description ||
      localOption.type !== existingOption.type ||
      localOption.required !== existingOption.required ||
      areChoicesDifferent(localOption.choices, existingOption.choices)
    );
  });
}

/**
 * Compare two sets of choices
 */
function areChoicesDifferent(
  choices1: Array<{ name: string; value: string | number }> = [],
  choices2: Array<{ name: string; value: string | number }> = []
): boolean {
  if (choices1.length !== choices2.length) {
    return true;
  }

  return choices1.some(
    (choice, index) =>
      choice.name !== choices2[index].name ||
      choice.value !== choices2[index].value
  );
}

/**
 * Compare existing and local commands
 */
export function areCommandsDifferent(
  existingCommand: Command,
  localCommand: Command
): boolean {
  // Compare descriptions
  if (existingCommand.description !== localCommand.description) {
    return true;
  }

  // Compare options
  return areOptionsDifferent(existingCommand.options, localCommand.options);
}

export default areCommandsDifferent;
