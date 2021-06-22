## Storybook Skeleton

A "skeleton" version of SB designed to do the bare minimum as quickly as possible and as a test bed for new webpack configs/features.

## Basic architecture

What this project creates is a [composition](https://storybook.js.org/docs/react/workflows/storybook-composition) API compatible Storybook preview which performs the "minimum" functions of Storybook with the least amount of code possible.

Then we use a pre-built manager UI, configured to compose the skeleton, in order to get the "full" Storybook experience with the skeleton-built preview.

## Running the skeleton

The process to build and run the skeleton is as follows:

1. Check out the skeleton code on your machine and symlink inside your project at `skeleton`

2. Ensure you have `webpack`, `webpack-cli` and `webpack-dev-server` installed.

3. Add a `skeletonWebpackConfig` field to `.storybook/main.js` with the minimal webpack config you need to compile your stories/components.

4. Run the skeleton with `yarn webpack serve --config ./skeleton/webpack/webpack.config.js`

The following additional parameters are supported:

- `BUILDER=babel` - It accepts "none", "babel", "esbuild", and "swc" and defaults to "none".
- `COMPILE_LAZILY=1` - Set to enable lazy compilation.
- `IMPORT=lazy-require-context` - How to import CSF files (not all options are available for all projects). Options: `lazy-require-context|require-context|dynamic|static|lazy-static|virtual`
- `VERTICAL=1` - Split "vertically" by transforming CSF files to import components async.
- `PROFILE_CPU=1` - Enables [the CPU profiler](https://github.com/jantimon/cpuprofile-webpack-plugin) and emits a flamegraph that can be examined using Chrome Inspector.
- `ENABLE_SOURCE_MAPS=1` - Enables generation of source maps
- `ENABLE_FS_CACHE=1` - Enabled webpack's file system level cache
- `ENABLE_CDN=1` - Load Lodash and React from a CDN

5. Run the prebuild manager (inside the skeleton project):

```
yarn start-manager
```

6. Browse to the URL from step 3: http://localhost:8080

## Examples

- The CLI (react) template is setup in `examples/template` and can be run as in steps 4-6 above.

- The Storybook design system `skeleton` branch is setup additionally (you will need to symlink).

## Benchmarking

Run `yarn benchmark` and it will give you some numbers as it builds `design-system` (make sure to link first as above) using different tools available.

## Code structure

- `src/storybook` - the skeleton's Storybook implementation. This is mostly a cobbled together collection of code / reimplementations from Storybook's source, and can be ignored. The one file of interest is probably `loadStory.js` which combines the `require.context` and `stories.json` data to `require()` a CSF file on demand.

- `webpack/webpack.config.js` - the webpack config we are using.

That is about it for now!

## Limitations

- Only works with React projects.

- Only works with CSF (in particular ignores MDX files).

- You must use `main.js:stories` with a glob.
