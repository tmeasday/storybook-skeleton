const libraries = {
  "./Button.stories.jsx": () => import(`./src/Button.stories.jsx`),
  "./Header.stories.jsx": () => import(`./src/Header.stories.jsx`),
  "./Page.stories.jsx": () => import(`./src/Page.stories.jsx`),
};
export const importFn = (name) => libraries[name]();
