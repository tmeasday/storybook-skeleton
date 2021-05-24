import { configure } from "./storybook";
import { libraries } from "./template-libraries";

// 1. Standard lazy require context
// const importFn = require.context(
//   "./template",
//   true,
//   /.*\.stories\.jsx$/,
//   "lazy"
// );

// 2. Using a "shaped" async import
// const importFn = async (name) => {
//   const parsedName = name.match(/^\.\/(.*)\.jsx$/)[1];
//   return import(`./template/${parsedName}.jsx`);
// };

// 3. Using a static async import
// const libraries = {
//   "./Button.stories.jsx": () => import(`./template/Button.stories.jsx`),
//   "./Header.stories.jsx": () => import(`./template/Header.stories.jsx`),
//   "./Page.stories.jsx": () => import(`./template/Page.stories.jsx`),
// };
const importFn = (name) => libraries[name]();

const storiesJson = require("../stories-json/template.stories.json");

configure(importFn, storiesJson);
