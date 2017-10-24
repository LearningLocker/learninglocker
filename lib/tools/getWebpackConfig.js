const path = require('path');
const webpack = require('webpack');
const extend = require('extend');
const AssetsPlugin = require('assets-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

// Common configuration chunk to be used for both
// client-side and server-side bundles
// -----------------------------------------------------------------------------
function getWebpackConfig(args) {
  const isDebug = args.isDebug;
  const isVerbose = args.isVerbose;
  const sourceDir = args.sourceDir;
  const outputDir = args.outputDir;
  const entry = args.entry;
  const stats = args.stats;
  const isClient = args.isClient;
  const copyPaths = args.copyPaths || [];
  const bannerPrefix = args.bannerPrefix || null;

  // freeVariables must be defined in the .eslintrc file
  const clientFreeVariables = args.clientFreeVariables || {};
  const serverFreeVariables = args.serverFreeVariables || {};

  const port = parseInt(process.env.UI_PORT, 10);
  const devPort = 3131;
  const assetPort = isDebug ? devPort : port;

  let publicPath = '';
  if (isDebug) {
    const host = process.env.UI_HOST || '127.0.0.1';
    publicPath += `//${host}:${assetPort}`;
  }
  publicPath += '/';

  const cssLoader = {
    // CSS Loader https://github.com/webpack/css-loader
    loader: 'css-loader',
    options: {
      importLoaders: 1,
      sourceMap: false,
      // CSS Modules https://github.com/css-modules/css-modules
      modules: true,
      localIdentName: isDebug
        ? '[name]-[local]-[hash:base64:5]'
        : '[hash:base64:5]',
      // CSS Nano http://cssnano.co/options/
      minimize: !isDebug,
      discardComments: { removeAll: true }
    }
  };

  // eslint-disable-next-line
  let banner = 'var dotenv = require("dotenv");\
    if(process.env.RUNTIME_NODE_ENV === "test") {\
      dotenv.config({path: ".env.test"});\
    } else {\
      dotenv.config();\
    }\
  \n';

  if (bannerPrefix) {
    banner += '\n';
    banner += `${bannerPrefix}\n`;
  }
  banner += 'require("source-map-support").install();\n';

  const config = {
    context: sourceDir,
    output: {
      path: path.resolve(outputDir),
      filename: 'index.js',
      publicPath
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            // https://github.com/babel/babel-loader#options
            cacheDirectory: isDebug,

            // https://babeljs.io/docs/usage/options/
            babelrc: true
          }
        },
        {
          test: /\.css/,
          exclude: /static/,
          loaders: ['isomorphic-style-loader', cssLoader, 'postcss-loader']
        },
        {
          test: /\.scss/,
          exclude: /static/,
          loaders: ['style-loader', cssLoader, 'postcss-loader', 'sass-loader']
        },
        {
          test: /\.(txt|md)$/,
          loader: 'raw-loader'
        },
        {
          test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
          loader: 'file-loader',
          query: {
            name: isDebug ? '[path][name].[ext]?[hash:8]' : '[hash:8].[ext]'
          }
        },
        {
          test: /\.(mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
          loader: 'url-loader',
          query: {
            name: isDebug ? '[path][name].[ext]?[hash:8]' : '[hash:8].[ext]',
            limit: 10000
          }
        }
      ]
    },
    resolve: {
      modules: [sourceDir, path.join(__dirname, '..'), 'node_modules'],
      alias: {
        api: path.resolve(__dirname, '..', '..', 'api', 'src'),
        ui: path.resolve(__dirname, '..', '..', 'ui', 'src'),
        worker: path.resolve(__dirname, '..', '..', 'worker', 'src'),
        cli: path.resolve(__dirname, '..', '..', 'cli', 'src'),
        lib: path.resolve(__dirname, '..')
      }
    },

    // Don't attempt to continue if there are any errors.
    bail: !isDebug,
    profile: !!stats,
    cache: isDebug,

    stats: {
      colors: true,
      reasons: isDebug,
      hash: isVerbose,
      version: isVerbose,
      timings: true,
      chunks: isVerbose,
      chunkModules: isVerbose,
      cached: isVerbose,
      cachedAssets: isVerbose
    },

    plugins: [
      // Emit a file with assets paths
      // https://github.com/sporto/assets-webpack-plugin#options
      new AssetsPlugin({
        path: outputDir,
        filename: 'assets.json',
        processOutput: assets => JSON.stringify(assets, null, 2)
      }),
      new CopyPlugin(copyPaths),
      new webpack.LoaderOptionsPlugin({
        debug: isDebug
      }),
      // allows generation of a stats bundle for use with the webpack analyzer
      // https://github.com/unindented/stats-webpack-plugin
      ...(stats
        ? [
          new StatsPlugin('stats.json', {
            chunkModules: true
          })
        ]
        : [])
    ]
  };

  //
  // Configuration for the client-side bundle (client.js)
  // -----------------------------------------------------------------------------
  if (isClient) {
    return extend(true, {}, config, {
      entry,
      output: {
        filename: isDebug ? '[name].js' : '[name].[chunkhash:8].js',
        chunkFilename: isDebug
          ? '[name].chunk.js'
          : '[name].[chunkhash:8].chunk.js'
      },
      target: 'web',
      plugins: config.plugins.concat([
        // Define free variables
        // https://webpack.github.io/docs/list-of-plugins.html#defineplugin
        new webpack.DefinePlugin(
          Object.assign(
            {
              'process.env.NODE_ENV': isDebug
                ? '"development"'
                : '"production"',
              'process.env.BROWSER': true,
              __CLIENT__: true,
              __SERVER__: false,
              __DEVELOPMENT__: isDebug,
              __DEVTOOLS__: false // <-------- DISABLE redux-devtools HERE
            },
            clientFreeVariables
          )
        ),

        // Move modules that occur in multiple entry chunks to a new entry chunk (the commons chunk).
        // http://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          minChunks: module => /node_modules/.test(module.resource)
        }),

        ...(isDebug
          ? []
          : [
            // Minimize all JavaScript output of chunks
            // https://github.com/mishoo/UglifyJS2#compressor-options
            new webpack.optimize.UglifyJsPlugin({
              compress: {
                screw_ie8: true, // React doesn't support IE8
                warnings: isVerbose
              },
              mangle: {
                screw_ie8: true
              },
              output: {
                comments: false,
                screw_ie8: true
              }
            })
          ])
      ]),

      // Choose a developer tool to enhance debugging
      // http://webpack.github.io/docs/configuration.html#devtool
      devtool: isDebug ? 'eval' : false,

      // Some libraries import Node modules but don't use them in the browser.
      // Tell Webpack to provide empty mocks for them so importing them works.
      // https://webpack.github.io/docs/configuration.html#node
      // https://github.com/webpack/node-libs-browser/tree/master/mock
      node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
      }
    });
  }

  //
  // Configuration for the server-side bundle (server.js)
  // -----------------------------------------------------------------------------
  return extend(true, {}, config, {
    entry,

    output: {
      libraryTarget: 'commonjs2'
    },

    target: 'node',

    externals: [
      '.env',
      // assets.json is an output from other build process and must be required from dist not src
      /assets\.json/,
      // serverside we include all node modules at runtime instead of bundling
      // https://www.npmjs.com/package/webpack-node-externals
      nodeExternals({
        // load non-javascript files with extensions via loaders
        // load anything in react-toolbox via loaders
        whitelist: [/\.(?!(?:jsx?|json)$).{1,5}$/i, /react-toolbox/]
      })
    ],
    plugins: [
      ...config.plugins,
      // Define free variables
      // https://webpack.github.io/docs/list-of-plugins.html#defineplugin
      new webpack.DefinePlugin(
        Object.assign(
          {
            'process.env.NODE_ENV': isDebug ? '"development"' : '"production"',
            'process.env.BROWSER': false,
            __CLIENT__: true,
            __SERVER__: false,
            __DEVELOPMENT__: isDebug,
            __DEVTOOLS__: false
          },
          serverFreeVariables
        )
      ),

      // Do not create separate chunks of the server bundle
      // https://webpack.github.io/docs/list-of-plugins.html#limitchunkcountplugin
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),

      // Adds a banner to the top of each generated chunk to
      // 1. configure sourcemap support
      // 2. bootstrap our env with dotenv
      // https://webpack.github.io/docs/list-of-plugins.html#bannerplugin
      new webpack.BannerPlugin({
        banner,
        raw: true,
        entryOnly: false,
        exclude: /\.s?css/
      })
    ],

    node: {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __filename: false,
      __dirname: false
    },

    devtool: isDebug ? 'cheap-module-source-map' : 'source-map'
  });
}

module.exports = getWebpackConfig;
