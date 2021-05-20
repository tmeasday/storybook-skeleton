module.exports = {
  loaders: [
    {
      test: /\.(m?[t|j]s)$/,
      resolve: {
        fullySpecified: false,
      },
    },
    {
      test: /\.svg$/,
      loader: 'react-svg-loader',
      options: {
        jsx: true,
      },
    },
    {
      test: /\.(graphql|gql)$/,
      include: [/schema/],
      exclude: /node_modules/,
      loader: 'raw-loader',
    },
    {
      test: /\.handlebars/,
      loader: 'handlebars-loader',
      exclude: /node_modules/,
      // query: {
      //   helperDirs: path.join(__dirname, '..','lib', 'emails', 'helpers'),
      // },
    },
  ],
};
