import webpack from 'webpack'
import _concat from 'lodash/concat'
import path from 'path'
// webpack plugins
import AssetsPlugin from 'assets-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import BabelExternalHelpersWebpackPlugin from 'babel-external-helpers-webpack-plugin'
import * as babel from 'babel-core'
import strictUriEncode from 'strict-uri-encode'
import { ReactLoadablePlugin } from 'react-loadable/webpack'
import sass from 'sass'
import { get as getConfig } from './lib/config'
import { isLocal, get as getEnv } from './lib/environment'
import { version } from './package.json'

const config = getConfig()
const excludePaths = /node_modules/
const nodePath = config.nodePath.split(':')
const outputFilenameJs = isLocal() ? '[name].js' : '[name].[chunkhash].js'
const outputFilenameCss = isLocal() ? '[name].css' : '[name].[chunkhash].css'
const outputPath = path.resolve(__dirname, './dist/browser')

const ASSETS_SERVER = process.env.ASSETS_SERVER || (isLocal() ? 'http://localhost:8081' : '')
const ASSETS_PATH = process.env.ASSETS_PATH || (isLocal() ? '/' : `/assets/${strictUriEncode(version)}/`)
const NODE_ENV = getEnv()
const buildEnv = {
  // This has effect on the react lib size
  NODE_ENV: JSON.stringify(NODE_ENV),
  BROWSER: JSON.stringify(true),
  ASSETS_URL: JSON.stringify(`${ASSETS_SERVER}${ASSETS_PATH}`),
}

export default {
  mode: isLocal() ? 'development' : 'production',
  devServer: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.lan',
      '.gaia.com',
      '.gaia.local',
    ],
    host: '0.0.0.0',
    port: 8081,
    hot: true,
    compress: false,
    overlay: {
      warnings: false,
      errors: true,
    },
    stats: { colors: true },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-type, Authorization, X-Client-Attributes',
    },
    watchOptions: {
      poll: true,
    },
  },
  entry: {
    main: [
      'babel-polyfill',
      path.resolve(__dirname, './browser.js'),
    ],
  },
  externals: { newrelic: 'newrelic' },
  plugins: getPlugins(),
  target: 'web',
  devtool: getDevTool(),
  bail: !isLocal(),
  output: {
    path: outputPath,
    publicPath: '', // Applied dynamically using __webpack_public_path__
    filename: outputFilenameJs,
    chunkFilename: outputFilenameJs,
  },
  resolve: {
    modules: _concat(['node_modules'], nodePath),
    extensions: ['.js', '.jsx', '.json', '.scss', '.css'],
  },
  module: {
    rules: getRules(),
  },
  optimization: {
    minimize: !isLocal(),
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        test: /\.jsx?$/,
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: { safe: true },
      }),
    ],
  },
}

function getPlugins () {
  const optimizePlugins = isLocal() ?
    [new webpack.HotModuleReplacementPlugin()] :
    [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new AssetsPlugin(),
    ]
  // Add extract plugins for non-local builds.
  return _concat(
    [
      new BabelExternalHelpersWebpackPlugin({ babel }),
      new ReactLoadablePlugin({
        filename: './react-loadable.json',
      }),
      new MiniCssExtractPlugin({
        filename: outputFilenameCss,
        chunkFilename: outputFilenameCss,
        // insert is a converted to a string and runs in the browser
        // don't insert the styles if the element already exists
        insert: function insert (linkTag) {
          if (document.querySelector('#assets-main-stylesheet')) {
            return
          }
          document.head.appendChild(linkTag)
        },
      }),
      new webpack.DefinePlugin({ 'process.env': buildEnv }),
    ],
    optimizePlugins,
  )
}

function getRules () {
  const rules = [
    {
      test: /\.jsx?$/,
      loader: 'babel-loader',
      options: getBabelLoaderOptions(),
      exclude: excludePaths,
    },
    {
      test: /\.scss$/,
      exclude: /node_modules/,
      use: [
        isLocal() ? 'style-loader' : MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            importLoaders: 2, // use postcss-loader, and sass-loader on @import files
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                'postcss-preset-env',
                'postcss-flexbugs-fixes',
              ],
            },
          },
        },
        {
          loader: 'sass-loader',
          options: {
            sassOptions: {
              outputStyle: 'expanded',
              includePaths: nodePath,
            },
            // Prefer `dart-sass`
            implementation: sass,
          },
        },
      ],
    },
    {
      test: /\.css$/,
      use: [
        isLocal() ? 'style-loader' : MiniCssExtractPlugin.loader,
        'css-loader',
      ],
    },
    {
      test: /.*\.(gif|png|jpg|svg|pdf|eot|woff|ttf)$/,
      loader: 'file-loader',
      options: {
        hash: 'sha512',
        digest: 'hex',
        name: '[hash].[ext]',
      },
      type: 'javascript/auto',
    },
  ]
  return rules
}

function getBabelLoaderOptions () {
  const plugins = [
    [
      'module-resolver',
      { root: ['./lib'] },
    ],
    'transform-async-to-bluebird',
    'transform-promise-to-bluebird',
    'external-helpers',
    'transform-class-properties',
    'add-module-exports',
    'syntax-dynamic-import',
    'transform-object-rest-spread',
    ['lodash', { id: ['lodash', 'recompose'] }],
    'react-loadable/babel',
  ]
  return {
    cacheDirectory: true,
    babelrc: false,
    plugins,
    presets: [
      [
        'env',
        {
          targets: {
            browsers: [
              'last 2 versions',
            ],
          },
        },
      ],
      'react',
    ],
    sourceMaps: 'both',
    env: {
      production: {
        plugins: [
          'transform-react-remove-prop-types',
          'transform-react-constant-elements',
          'transform-react-inline-elements',
        ],
      },
    },
  }
}

function getDevTool () {
  return isLocal() ? 'cheap-eval-source-map' : 'source-map'
}
