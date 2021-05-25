import { configure } from "./storybook";
// This is aliased to one of:
//  - `template-entry-import-require-context` - import via `require.context(..., 'lazy')`;
//  - `template-entry-import-dynamic` - import via dynamic `await import()`
//  - `template-entry-import-static` - import via static `await import()`
//  - `template-entry-import-virtual` - import via static `await import()`, via virtual modules (TBD)
import { importFn } from "./template-entry-import";

const storiesJson = require("../stories-json/template.stories.json");

configure(importFn, storiesJson);
