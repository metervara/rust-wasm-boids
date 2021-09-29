const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './bootstrap.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bootstrap.js',
  },
  mode: 'development',
  plugins: [
    new CopyWebpackPlugin(['index.html']),
    new CopyWebpackPlugin(['m4.js']),
    new CopyWebpackPlugin(['webgl-utils.js'])
  ],
  module: {
    rules: [
      {
        test: /\.glsl$/,
        use: 'webpack-glsl-loader',
      },
    ],
  },
};
