import { configure } from './storybook';

import storiesJson from '../stories-json/template.stories.json';

configure(async (path) => import(path.replace('./', './template/')), storiesJson);
