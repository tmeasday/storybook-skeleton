import { configure } from './storybook';

const globalConfig = require('../design-system/.storybook/preview.js');

const context = require.context(
  '../design-system/src/components',
  true,
  /.*\.stories\.js$/,
  'lazy'
);

configure(context, globalConfig);
