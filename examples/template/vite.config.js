export default {
  plugins: [
    require("@vitejs/plugin-react-refresh")({
      // Do not treat story files as HMR boundaries, storybook itself needs to handle them.
      exclude: [/\.stories\.(t|j)sx?$/, /node_modules/],
    }),
  ],
};
