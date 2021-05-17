// Cop out these types ;)
export type Parameters = Record<string, any>;
export type StoryContext = Record<string, any>;
export type Args = Record<string, any>;
export type ArgTypes = Record<string, any>;

export type StoryContextUpdate = Record<string, any>;
export type PartialStoryFn<ReturnType = unknown> = (p?: StoryContextUpdate) => ReturnType;
export type LegacyStoryFn<ReturnType = unknown> = (p?: StoryContext) => ReturnType;
export type ArgsStoryFn<ReturnType = unknown> = (a?: Args, p?: StoryContext) => ReturnType;
export type StoryFn<ReturnType = unknown> = LegacyStoryFn<ReturnType> | ArgsStoryFn<ReturnType>;

export type DecoratorFunction<StoryFnReturnType = unknown> = (
  fn: PartialStoryFn<StoryFnReturnType>,
  c: StoryContext
) => ReturnType<LegacyStoryFn<StoryFnReturnType>>;

export type Meta<StoryFnReturnType> = {
  decorators?: DecoratorFunction<StoryFnReturnType>[];
  parameters?: Parameters;
  args?: Args;
  argTypes?: ArgTypes;
};

/**
 * Object representing the preview.ts module
 *
 * Used in storybook testing utilities.
 * @see [Unit testing with Storybook](https://storybook.js.org/docs/react/workflows/unit-testing)
 */
export type GlobalConfig<StoryFnReturnType = unknown> = {
  decorators?: DecoratorFunction<StoryFnReturnType>[];
  parameters?: Parameters;
  argTypes?: ArgTypes;
  [key: string]: any;
};

/**
 * T represents the whole es module of a stories file. K of T means named exports (basically the Story type)
 * 1. pick the keys K of T that have properties that are Story<AnyProps>
 * 2. infer the actual prop type for each Story
 * 3. reconstruct Story with Partial. Story<Props> -> Story<Partial<Props>>
 */
export type StoriesWithPartialProps<T> = {
  [K in keyof T as T[K] extends StoryFn<any> ? K : never]: T[K] extends StoryFn<infer P>
    ? StoryFn<Partial<P>>
    : unknown;
};

export type Story<StoryFnReturnType> = StoryFn<StoryFnReturnType> & {
  storyName?: String;
  args?: Args;
  argTypes?: ArgTypes;
  decorators?: DecoratorFunction<StoryFnReturnType>[];
  parameters?: Parameters;
  story: {
    args?: Args;
    argTypes?: ArgTypes;
    decorators?: DecoratorFunction<StoryFnReturnType>[];
    parameters?: Parameters;
  };
};
