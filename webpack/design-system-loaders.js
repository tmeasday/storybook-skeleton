module.exports = {
  loaders: [
    {
      test: /\.m?[t|j]sx?$/,
      resolve: {
        fullySpecified: false,
      },
    },
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    },
  ],
};
