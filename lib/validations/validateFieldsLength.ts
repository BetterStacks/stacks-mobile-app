export const validateFieldsLength = (...args: string[]) => {
  let isAllFilled = true;

  args.map(arg => {
    if (arg.trim().length === 0) {
      isAllFilled = false;
    }
    return arg;
  });

  return isAllFilled;
};
