import { configure } from "./storybook";

// This is aliased to one of:
//  - `design-system-import-require-context` - import via `require.context(..., 'lazy')`;
//  - `design-system-import-static` - import via static `await import()`
import { importFn } from "./design-system-entry-import";

import storiesJson from "../stories-json/design-system.stories.json";
import * as globalConfig from "../design-system/.storybook/preview.js";

configure(importFn, storiesJson, globalConfig);
