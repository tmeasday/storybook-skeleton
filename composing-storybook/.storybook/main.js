module.exports = {
  stories: ['../one.stories.js'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
  ],
  refs: {
    skeleton: {
      name: 'Skeleton',
      url: 'http://localhost:5000',
    },
  },
};
