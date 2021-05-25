const libraries = {
  "./Button.stories.jsx": () => import(`./template/Button.stories.jsx`),
  "./Header.stories.jsx": () => import(`./template/Header.stories.jsx`),
  "./Page.stories.jsx": () => import(`./template/Page.stories.jsx`),
};
export const importFn = (name) => libraries[name]();
