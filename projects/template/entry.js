import { configure } from "../../src/storybook";
// This is aliased to one of:
//  - `entry-import-require-context` - import via `require.context(..., 'lazy')`;
//  - `entry-import-dynamic` - import via dynamic `await import()`
//  - `entry-import-static` - import via static `await import()`
//  - `entry-import-virtual` - import via static `await import()`, via virtual modules (TBD)
import { importFn } from "./entry-import";

const storiesJson = require("./stories.json");

configure(importFn, storiesJson);
