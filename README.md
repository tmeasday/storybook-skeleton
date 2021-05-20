## Storybook Skeleton

A "skeleton" version of SB designed to do the bare minimum as quickly as possible and as a test bed for new webpack configs/features.

## Basic architecture

What this project creates is a [composition](https://storybook.js.org/docs/react/workflows/storybook-composition) API compatible Storybook preview which performs the "minimum" functions of Storybook with the least amount of code possible.

Then we use a pre-built manager UI, configured to compose the skeleton, in order to get the "full" Storybook experience with the skeleton-built preview.

## Example projects

The skeleton is setup to run stories from a collection of example real-world projects of varying complexity.

Currently we have two examples running:

- `template` -- the basic set of stories that are installed by the cli when you init a SB project. This project has 8 stories across 3 components.

- `design-system` -- the stories from the [Storybook Design System](https://github.com/storybookjs/design-system). This project has 181 stories across 42 components.

We may add more projects to the skeleton in the future but it is also relatively simple to configure it to run with other projects.

### Configuring examples

To configure an example named `$EXAMPLE`, you must provide 3 files:

- `stories-json/$EXAMPLE.stories.json` -- a `stories.json` as generated by a Storybook build using `6.2.0-alpha.30` or above. _ NOTE: currently you may need to hand-edit the `fileNames` in this file to match up with the file names expected by `require.context`. _

- `webpack/$EXAMPLE.loaders` - a `.js` file exporting a set of webpack5 loaders (on the `loaders` key) that are required to build the story+component files from the example project.

- `src/$PROJECT-entry.js` - a file that calls `configure` from `./storybook` with a `require.context` for the example's set of story files, the contents of the `stories.json` and (optionally) an imported `.storybook/preview.js`.

_NOTE:_ if the `require.context` is `lazy`, the CSF files will be loaded on-demand.

## Running the skeleton

Currently the process to build and run the skeleton is as follows:

0. If running the design system, check [the code](https://github.com/storybookjs/design-system) out and make a symlink from `./design-system` to it.

1. Build the webpack project into dist, with the `PROJECT` environment variable set:

```
export PROJECT=design-system; yarn webpack
```

> You can specify builder with the `BUILDER` parameter. It accepts "babel", "esbuild", and "swc" and defaults to "esbuild".

> There's a flag for lazy compilation. Set `LAZY_COMPILATION=1` to enable the feature.

2. Run a HTTP server on port 5000 out of `dist/`

```
npx http-server dist -p 5000 --cors
```

3. Run the prebuild manager:

```
npx http-server composing-storybook/storybook-static
```

4. Browse to the URL from step 3: http://localhost:8080

## Code structure

- `src/storybook` - the skeleton's Storybook implementation. This is mostly a cobbled together collection of code / reimplementations from Storybook's source, and can be ignored. The one file of interest is probably `loadStory.js` which combines the `require.context` and `stories.json` data to `require()` a CSF file on demand.

- `webpack.config.js` - the webpack config we are using.

That is about it for now!

## Limitations

- Does not currently run a dev server or hot-reload.

- Only works with React projects.

- Only works with CSF (in particular ignores MDX files).
