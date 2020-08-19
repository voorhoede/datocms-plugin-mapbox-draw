// eslint-disable-next-line import/no-extraneous-dependencies
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: path.join(__dirname, '/src/index.js'),
  mode: process.env.NODE_ENV,
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './',
    disableHostCheck: true,
    public: 'http://localhost:5000',
  },
  node: {
    fs: 'empty',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.join(__dirname, '/src'),
        loader: 'eslint-loader',
        enforce: 'pre',
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: { loader: 'babel-loader' },
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'DatoCMS Plugin',
      minify: isProduction,
    }),
    new HtmlWebpackTagsPlugin({
      append: false,
      publicPath: '',
      tags: [
        'https://unpkg.com/datocms-plugins-sdk@0.0.10/dist/sdk.js',
        'https://unpkg.com/datocms-plugins-sdk@0.0.10/dist/sdk.css',
        'https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css',
        'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.2.0/mapbox-gl-draw.css',
        'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.5.1/mapbox-gl-geocoder.css',
      ],
    }),
  ].filter(Boolean),
};
