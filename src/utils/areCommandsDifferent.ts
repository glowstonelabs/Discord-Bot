type Option = {
  name: string;
  description: string;
  type: number;
  required?: boolean;
  choices?: { name: string; value: string | number }[];
};

type Command = {
  name: string;
  description: string;
  options: Option[];
};

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
    console.log(`Choices length is different: ${choices1.length} vs ${choices2.length}`);
    return true;
  }

  for (let i = 0; i < choices1.length; i++) {
    if (choices1[i].name !== choices2[i].name || choices1[i].value !== choices2[i].value) {
      console.log(
        `Choice is different at index ${i}: "${JSON.stringify(choices1[i])}" vs "${JSON.stringify(
          choices2[i],
        )}"`,
      );
      return true;
    }
  }

  return false;
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
 * @param {Option[]} existingOptions - The existing options.
 * @param {Option[]} localOptions - The local options.
 * @returns {boolean} - True if the options are different, false otherwise.
 */
function areOptionsDifferent(existingOptions: Option[] = [], localOptions: Option[] = []): boolean {
  if (existingOptions.length !== localOptions.length) {
    console.log(`Options length is different: ${existingOptions.length} vs ${localOptions.length}`);
    return true;
  }

  for (const localOption of localOptions) {
    const existingOption = existingOptions.find((option) => option.name === localOption.name);

    if (!existingOption) {
      console.log(`Option "${localOption.name}" does not exist in existing options.`);
      return true;
    }

    if (
      cleanDescription(localOption.description) !== cleanDescription(existingOption.description) ||
      localOption.type !== existingOption.type ||
      (localOption.required ?? false) !== (existingOption.required ?? false) ||
      (localOption.choices?.length ?? 0) !== (existingOption.choices?.length ?? 0) ||
      areChoicesDifferent(localOption.choices ?? [], existingOption.choices ?? [])
    ) {
      console.log(`Option "${localOption.name}" is different:`);
      console.log(
        `Description: "${cleanDescription(existingOption.description)}" vs "${cleanDescription(
          localOption.description,
        )}"`,
      );
      console.log(`Type: "${existingOption.type}" vs "${localOption.type}"`);
      console.log(`Required: "${existingOption.required}" vs "${localOption.required}"`);
      return true;
    }
  }

  return false;
}

/**
 * Compares two commands to determine if they are different.
 * @param {Command} existingCommand - The existing command.
 * @param {Command} localCommand - The local command.
 * @returns {boolean} - True if the commands are different, false otherwise.
 */
function areCommandsDifferent(existingCommand: Command, localCommand: Command): boolean {
  if (
    cleanDescription(existingCommand.description) !== cleanDescription(localCommand.description) ||
    areOptionsDifferent(existingCommand.options, localCommand.options)
  ) {
    console.log(`Command "${localCommand.name}" is different:`);
    console.log(
      `Description: "${cleanDescription(existingCommand.description)}" vs "${cleanDescription(
        localCommand.description,
      )}"`,
    );
    return true;
  }

  return false;
}

export default areCommandsDifferent;
