const merge = require('webpack-merge');
const common = require('./webpack/webpack.common.config.js');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(common, {
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          ie8: false,
          ecma: 8,
          output: {
            comments: false,
            beautify: false
          },
          compress: {
            drop_console: true
          },
          warnings: false,
          unused: true,
          dead_code: true
        }
      })
    ]
  }
});
