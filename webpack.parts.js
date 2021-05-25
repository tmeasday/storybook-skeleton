const CpuProfilerWebpackPlugin = require("cpuprofile-webpack-plugin");
const VirtualModulesPlugin = require("webpack-virtual-modules");
const process = require("process");

const builderAlternatives = {
  esbuild: {
    test: /\.([t|j]sx?|svg)$/,
    loader: "esbuild-loader",
    exclude: /node_modules/,
    options: {
      loader: "tsx",
      target: "es2015",
    },
  },
  swc: {
    test: /\.([t|j]sx?)$/,
    loader: "swc-loader",
    exclude: /node_modules/,
    options: {
      jsc: {
        parser: {
          syntax: "typescript",
          tsx: true,
        },
        transform: {
          react: {
            pragma: "React.createElement",
            pragmaFrag: "React.Fragment",
            throwIfNamespace: true,
            development: false,
            useBuiltins: false,
          },
        },
      },
    },
  },
  babel: {
    test: /\.([t|j]sx?)$/,
    loader: "babel-loader",
    exclude: /node_modules/,
    options: {
      presets: [
        ["@babel/preset-env", { targets: "defaults" }],
        "@babel/preset-typescript",
        "@babel/preset-react",
      ],
    },
  },
};

const virtualModules = new VirtualModulesPlugin({
  "./src/template-libraries.js": `
    export const libraries = {
      "./Button.stories.jsx": () => import('./template/Button.stories.jsx'),
      "./Header.stories.jsx": () => import('./template/Header.stories.jsx'),
    };
  `,
});
process.on("SIGUSR2", () => {
  console.log("SIGUSR2");
  virtualModules.writeModule(
    "./src/template-libraries.js",
    `
      export const libraries = {
        "./Button.stories.jsx": () => import('./template/Button.stories.jsx'),
        "./Header.stories.jsx": () => import('./template/Header.stories.jsx'),
        "./Page.stories.jsx": () => import('./template/Page.stories.jsx'),
      };
    `
  );
});

const projects = {
  chromatic: {
    module: {
      rules: [
        {
          test: /\.(m?[t|j]s)$/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.svg$/,
          loader: "react-svg-loader",
          options: {
            jsx: true,
          },
        },
        {
          test: /\.(graphql|gql)$/,
          include: [/schema/],
          exclude: /node_modules/,
          loader: "raw-loader",
        },
        {
          test: /\.handlebars/,
          loader: "handlebars-loader",
          exclude: /node_modules/,
          // query: {
          //   helperDirs: path.join(__dirname, '..','lib', 'emails', 'helpers'),
          // },
        },
      ],
    },
    resolve: {
      fallback: { path: require.resolve("path-browserify") },
    },
  },
  "design-system": {
    module: {
      rules: [
        {
          test: /\.m?[t|j]sx?$/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          use: [
            {
              loader: "file-loader",
            },
          ],
        },
      ],
    },
  },
  template: {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [virtualModules],
  },
};

const cpuProfiler = {
  plugins: [new CpuProfilerWebpackPlugin()],
};

module.exports = {
  builderAlternatives,
  projects,
  cpuProfiler,
};
