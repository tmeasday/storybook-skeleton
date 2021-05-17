import { configure } from './storybook';

const globalConfig = require('../../../Chroma/chromatic/.storybook/preview.js');

const context = require.context(
  '../../../Chroma/chromatic/services/webapp/components',
  true,
  /.*\.stories\.js$/,
  'lazy'
);

configure(context, globalConfig);
