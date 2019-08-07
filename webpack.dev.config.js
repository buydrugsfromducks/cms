const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack/webpack.common.config.js');

module.exports = merge(common, {
  watch: true,
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /.spec\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['env', 'es2015', 'react'],
          cacheDirectory: true
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({'process.env': {NODE_ENV: 'testing'}}),
  ],
  devServer: {
    port: 3000,
    contentBase: common.context,
    disableHostCheck: true,
    open: process.env.WEBPACK_SERVER_BROWSER || 'Chrome',
    historyApiFallback: true,
    openPage: '',
    
    stats: {
      warnings: false
    },
    
    proxy: [
      {
        context: ['/api/**'],
        target: 'https://api.dev.eventdna.net/',
        pathRewrite: {'^/api': '/services'},
        secure: false,
        onProxyReq: (proxyReq, req, res) => {
          proxyReq.setHeader('Host', 'api.dev.eventdna.net');
        }
      }
    ]
  }
});
