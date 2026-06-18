/**
 * Webpack Configuration for Production Build
 * Optimizes JavaScript and CSS bundling with minification and code splitting
 */

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  mode: isProduction ? 'production' : 'development',
  entry: {
    app: './js/app.js',
    pageInit: './js/page-init.js',
    public: './js/public.js',
    navbar: './js/navbar.js',
    uiUtils: './js/ui-utils.js',
    performanceUtils: './js/performance-utils.js',
    dynamicLoader: './js/dynamic-loader.js',
    cssLoader: './js/css-loader.js',
    scrollOptimization: './js/scroll-optimization.js',
    memoryLeakPrevention: './js/memory-leak-prevention.js',
    serviceWorkerRegistration: './js/service-worker-registration.js',
    lazyComponents: './js/lazy-components.js',
    virtualScroll: './js/virtual-scroll.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProduction ? 'js/[name].[contenthash:8].min.js' : 'js/[name].js',
    chunkFilename: isProduction ? 'js/[name].[contenthash:8].min.js' : 'js/[name].js',
    clean: true,
    publicPath: '/'
  },
  optimization: {
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: isProduction,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: {
      name: 'runtime',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-syntax-dynamic-import'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8192, // 8kb
          },
        },
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
      {
        test: /\.(woff|woff2|ttf|eot)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    ...(isProduction
      ? [
          new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash:8].min.css',
            chunkFilename: 'css/[name].[contenthash:8].min.css',
          }),
        ]
      : []),
    // Add HtmlWebpackPlugin for critical HTML files
    new HtmlWebpackPlugin({
      template: './pages/public/home/home.html',
      filename: 'pages/public/home/home.html',
      chunks: ['app'],
      inject: 'body',
      minify: isProduction,
    }),
  ],
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@js': path.resolve(__dirname, 'js'),
      '@css': path.resolve(__dirname, 'css'),
      '@backend': path.resolve(__dirname, 'backend'),
    },
  },
  devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
  performance: {
    hints: isProduction ? 'warning' : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  cache: {
    type: 'filesystem',
  },
};

module.exports = config;