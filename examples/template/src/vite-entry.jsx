import { configure } from '../skeleton/src/storybook';

const storiesJson = {"v": 3, "stories": {"example-page--loggedin": {"id": "example-page--loggedin", "name": "LoggedIn", "parameters": {"__isArgsStory": false, "__id": "example-page--loggedin", "fileName": "../src/Page.stories.jsx"}, "kind": "Example/Page"}, "example-page--loggedout": {"id": "example-page--loggedout", "name": "LoggedOut", "parameters": {"__isArgsStory": false, "__id": "example-page--loggedout", "fileName": "../src/Page.stories.jsx"}, "kind": "Example/Page"}, "example-button--primary": {"id": "example-button--primary", "name": "Primary", "parameters": {"__isArgsStory": false, "__id": "example-button--primary", "fileName": "../src/Button.stories.jsx"}, "kind": "Example/Button"}, "example-button--secondary": {"id": "example-button--secondary", "name": "Secondary", "parameters": {"__isArgsStory": false, "__id": "example-button--secondary", "fileName": "../src/Button.stories.jsx"}, "kind": "Example/Button"}, "example-button--large": {"id": "example-button--large", "name": "Large", "parameters": {"__isArgsStory": false, "__id": "example-button--large", "fileName": "../src/Button.stories.jsx"}, "kind": "Example/Button"}, "example-button--small": {"id": "example-button--small", "name": "Small", "parameters": {"__isArgsStory": false, "__id": "example-button--small", "fileName": "../src/Button.stories.jsx"}, "kind": "Example/Button"}, "example-header--loggedin": {"id": "example-header--loggedin", "name": "LoggedIn", "parameters": {"__isArgsStory": false, "__id": "example-header--loggedin", "fileName": "../src/Header.stories.jsx"}, "kind": "Example/Header"}, "example-header--loggedout": {"id": "example-header--loggedout", "name": "LoggedOut", "parameters": {"__isArgsStory": false, "__id": "example-header--loggedout", "fileName": "../src/Header.stories.jsx"}, "kind": "Example/Header"}}};

const imports = {
  ["../src/Button.stories.jsx"]: () => import("./Button.stories.jsx"),
  ["../src/Header.stories.jsx"]: () => import("./Header.stories.jsx"),
  ["../src/Page.stories.jsx"]: () => import("./Page.stories.jsx")
};

const importFn = (path) => imports[path]();

console.log('running configure')
configure(importFn, storiesJson, {}, import.meta.hot)

// import.meta.hot.dispose(() => console.log('HMR dispose'))
import.meta.hot.accept();
// import.meta.hot.accept((m) => {
//   console.log("HMR")
//   console.log(m)
// });