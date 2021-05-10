import { loadCsfFile } from './loadCsfFile';

const context = require.context(
  '../../../Chroma/chromatic/services/webapp/components',
  true,
  /.*\.stories\.js$/
);

console.log(context.keys());

async function go() {
  console.log(await context(context.keys[0]));
}

go()
  .then(() => console.log('done'))
  .catch((err) => console.log({ err }));
