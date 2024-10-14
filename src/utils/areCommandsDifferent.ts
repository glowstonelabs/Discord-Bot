type Choice = {
  name: string;
  value: string | number | boolean;
};

type Option = {
  name: string;
  description: string;
  type: string;
  required?: boolean;
  choices?: Choice[];
};

type Command = {
  description: string;
  options?: Option[];
};

export default (existingCommand: Command, localCommand: Command): boolean => {
  const areChoicesDifferent = (
    existingChoices: Choice[] = [],
    localChoices: Choice[] = []
  ): boolean => {
    for (const localChoice of localChoices) {
      const existingChoice = existingChoices.find(
        (choice) => choice.name === localChoice.name
      );

      if (!existingChoice || localChoice.value !== existingChoice.value) {
        return true;
      }
    }
    return false;
  };

  const areOptionsDifferent = (
    existingOptions: Option[] = [],
    localOptions: Option[] = []
  ): boolean => {
    for (const localOption of localOptions) {
      const existingOption = existingOptions.find(
        (option) => option.name === localOption.name
      );

      if (
        !existingOption ||
        localOption.description !== existingOption.description ||
        localOption.type !== existingOption.type ||
        (localOption.required ?? false) !==
          (existingOption.required ?? false) ||
        (localOption.choices?.length ?? 0) !==
          (existingOption.choices?.length ?? 0) ||
        areChoicesDifferent(
          localOption.choices ?? [],
          existingOption.choices ?? []
        )
      ) {
        return true;
      }
    }
    return false;
  };

  return (
    existingCommand.description !== localCommand.description ||
    areOptionsDifferent(existingCommand.options, localCommand.options)
  );
};
