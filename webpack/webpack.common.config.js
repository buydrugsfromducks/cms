const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');

const isProduction = process.env.NODE_ENV === 'production';
const outPath = path.join(__dirname, '../dist');
const sourcePath = path.join(__dirname, '../src');

module.exports = {
  context: sourcePath,
  entry: {
    main: './index.tsx',
    vendor: [
      'react',
      'react-dom',
      'react-redux',
      'react-router',
      'react-router-dom',
      'redux',
      'antd'
    ]
  },
  output: {
    path: outPath,
    publicPath: '/',
    filename: '[name].[hash:8].js'
  },
  mode: isProduction ? 'production' : 'development',
  target: 'web',
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    mainFields: ['browser', 'main']
  },
  module: {
    rules: [
      {test: /\.tsx?$/, enforce: 'pre', loader: 'tslint-loader'},
      {
        test: /\.tsx?$/,
        use: [
          'react-hot-loader/webpack',
          'ts-loader'
        ],
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            plugins: [
              ['transform-runtime', {regenerator: false}],
              ['import', {
                libraryName: 'antd'
              }],
            ],
            presets: [
              ['env', {
                targets: {
                  browsers: [
                    'not ie <= 10'
                  ]
                },
                useBuiltIns: false,
                modules: false,
                uglify: true,
                debug: isProduction
              }],
              'react',
              'stage-0'
            ],
            env: {
              development: {
                plugins: [
                  ['react-transform', {
                    transforms: [
                      {
                        transform: 'react-transform-catch-errors',
                        imports: ['react', 'redbox-react']
                      }
                    ]
                  }]
                ]
              },
              production: {
                plugins: [
                  'transform-react-constant-elements'
                ]
              }
            }
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              root: path.resolve(__dirname),
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                autoprefixer({
                  'browsers': ['last 2 versions', 'ie >= 10'],
                }),
              ],
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              outputStyle: 'compressed',
              sourceMap: true,
              includePaths: [
                './src/scss',
              ],
            },
          }
        ]
      },
      {
        test: /\.html$/,
        use: [{loader: 'html-loader', options: {root: path.resolve(__dirname),},},],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {loader: 'style-loader', options: {sourceMap: false}},
          {loader: 'css-loader', options: {sourceMap: false}},
          {loader: 'postcss-loader', options: {sourceMap: false}}
        ]
      },
      {test: /\.(jpe?g|png|gif)$/i, loader: 'url-loader?limit=10000!img-loader?progressive=true'},
      {test: /\.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/, loader: 'file-loader?name=fonts/[name].[ext]'},
      {test: /\.svg$/, loader: 'url-loader?limit=10000!img-loader'}
    ]
  },
  plugins: [
    new webpack.DefinePlugin({'process.env': {NODE_ENV: JSON.stringify(process.env.NODE_ENV)}}),
    new CheckerPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ru/),
    new MiniCssExtractPlugin({filename: '[name].css', chunkFilename: '[name].css', disable: !isProduction}),
    new HtmlWebpackPlugin({template: 'index.html'}),
    new LodashModuleReplacementPlugin({
      shorthands: true,
      cloning: true,
      currying: true,
      collections: true,
      coercions: true,
      flattening: true,
      paths: true
    }),
    new CopyWebpackPlugin([
      // {from: 'static/imgs', to: 'static/imgs'},
      // {from: 'static/fonts', to: 'static/fonts'}
    ]),
    new webpack.LoaderOptionsPlugin({options: {context: process.cwd()}})
  ],
  node: {
    fs: 'empty',
    net: 'empty'
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          name: 'bundle',
          chunks: 'initial'
        }
      }
    }
  }
};
