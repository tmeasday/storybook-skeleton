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
    {
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: [
        {
          loader: 'file-loader',
        },
      ],
    },
  ],
};
