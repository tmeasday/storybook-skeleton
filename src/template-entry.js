import { configure } from './storybook';

const context = require.context('./template', true, /.*\.stories\.js$/, 'lazy');
const storiesJson = require('../stories-json/template.stories.json');

configure(context, storiesJson);
