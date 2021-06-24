module.exports = {
  stories: "../src/**/*.stories.jsx",
  skeletonWebpackConfig: {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
  },
};
