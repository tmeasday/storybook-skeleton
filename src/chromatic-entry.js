import { configure } from './storybook';

const globalConfig = require('../chromatic/.storybook/preview.js');

const context = require.context('../chromatic/services/webapp', true, /.*\.stories\.js$/, 'lazy');

const storiesJson = require('../stories-json/chromatic.stories.json');

configure(context, storiesJson, globalConfig);
