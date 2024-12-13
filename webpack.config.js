const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); //to access built-in plugins
const CopyPlugin = require("copy-webpack-plugin");
const ReplaceInFileWebpackPlugin = require("replace-in-file-webpack-plugin");
const RemovePlugin = require('remove-files-webpack-plugin');

const packageInfo = require("./package.json");

const config = {
  entry: './build/index.js',
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/web/index.html' }),
    new CopyPlugin({
      patterns: [
        { from: "build/index.css", to: "." },
        // { from: "images", to: "./images" },
        // { from: "src/web/manifest.json", to: "." },
      ],
    }),
    new RemovePlugin({
      before: {
        include: [
          './dist'
        ]
      },
    }),
    new ReplaceInFileWebpackPlugin([{
      dir: 'dist',
      files: ['index.html'],
      rules: [{
        search: 'index.css',
        replace: 'index.css?' + packageInfo.version
      }]
    }]),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};

module.exports = (env, argv) => {
  if (argv.mode !== "production") {
    config.output.filename = "bundle.js";
    config.watch = true;
  }

  return config;
}