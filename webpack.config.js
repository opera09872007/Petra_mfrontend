const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  // Specify the entry point for our app.
  entry: [path.join(__dirname, 'aws-s3.js')],
  // Specify the output file containing our bundled code.
  output: {
    path: __dirname,
    filename: 'aws-s3.min.js',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false, // omit Licence.txt file generation
      }),
    ],
  },
  // Enable WebPack to use the 'path' package.
  // resolve: {
  //   fallback: { path: require.resolve('path-browserify') },
  // },
};
