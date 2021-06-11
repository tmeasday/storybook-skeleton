export const importFn = async (name) => {
  const parsedName = name.match(/^\.\/(.*)\.jsx$/)[1];
  return import(`./src/${parsedName}.jsx`);
};
