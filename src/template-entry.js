import { configure } from './storybook';

const context = require.context('./template', true, /.*\.stories\.js$/, 'lazy');

configure(context);
