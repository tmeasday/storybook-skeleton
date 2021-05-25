import { configure } from "./storybook";

// This is aliased to one of:
//  - `chromatic-import-require-context` - import via `require.context(..., 'lazy')`;
//  - `chromatic-import-static` - import via static `await import()`
import { importFn } from "./chromatic-entry-import";

import storiesJson from "../stories-json/chromatic.stories.json";
import * as globalConfig from "../chromatic/.storybook/preview.js";

configure(importFn, storiesJson, globalConfig);
