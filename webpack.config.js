const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const production = (argv.mode === 'production');

  return {
    mode: production ? 'production' : 'development',
    entry: './client/src/js/app.js',
    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'public'),
      publicPath: production ? 'https://stamp.mikumo.abcang.net/' : '/',
    },
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[contenthash][ext]',
          },
        },
        {
          test: /favicon\.ico$/i,
          type: 'asset/resource',
          generator: {
            filename: '[name][ext]',
          },
        },
        {
          test: /\.js$/i,
          include: [
            path.resolve(__dirname, 'client/src'),
          ],
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                ],
              },
            },
          ],
        },
        {
          test: /\.sass$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: !production,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: !production,
              },
            },
          ],
        },
        {
          test: /\.html$/i,
          use: [
            {
              loader: 'html-loader',
              options: {
                sources: {
                  // eslint-disable-next-line no-unused-vars
                  urlFilter: (attribute, value, resourcePath) => {
                    // The `attribute` argument contains a name of the HTML attribute.
                    // The `value` argument contains a value of the HTML attribute.
                    // The `resourcePath` argument contains a path to the loaded HTML file.

                    if (value === '/socket.io/socket.io.js') {
                      return false;
                    }

                    return true;
                  },
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'client/src/index.html',
        minify: true,
      }),
      new CopyPlugin({
        patterns: [
          { from: 'client/src/stamp', to: 'stamp' },
        ],
      }),
    ],
  };
};
