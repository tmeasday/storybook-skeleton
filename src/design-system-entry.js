import { configure } from './storybook';

const globalConfig = require('../design-system/.storybook/preview.js');

const context = require.context('../design-system/src', true, /.*\.stories\.[j|t]sx?$/, 'lazy');
const storiesJson = require('../stories-json/design-system.stories.json');
console.log(storiesJson);

configure(context, storiesJson, globalConfig);
