const formatValue = arg => (arg && arg.toJS ? arg.toJS() : arg);

const logFunctionInfo = (caller, label, args, result) => {
  console.timeEnd(label);
  const formattedArgs = args.map(formatValue);
  const formattedRes = formatValue(result);
  const stack = (new Error()).stack.split('    at ').slice(1);
  console.log(label, caller);
  console.log(label, {
    args, result, formattedArgs, formattedRes, stack
  });
};

const logIO = name => (func) => {
  let run = 0;
  const caller = (new Error()).stack.split('    at ')[2];
  return (...args) => {
    const label = `${name} ${run += 1}`;
    try {
      console.time(label);
      const result = func(...args);
      if (result && result.constructor === Function) {
        logFunctionInfo(caller, label, args, result);
        return logIO(`${label} ()`)(result);
      }
      logFunctionInfo(caller, label, args, result);
      return result;
    } catch (err) {
      logFunctionInfo(caller, label, args, undefined);
      throw err;
    }
  };
};

export default logIO;
