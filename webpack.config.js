// @ts-check
const path = require('path')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')

const { CleanWebpackPlugin } = require('clean-webpack-plugin') // Wow!

/**@type {import('webpack').Configuration}*/ const config = {
  target: 'node',
  node: {
    __dirname: false
  },

  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]' // means source code in dist/../[resource-path]
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new CopyPlugin({
      patterns: [{ from: 'src/utils/clipboard', to: 'clipboard' }]
    })
  ]
}

module.exports = config
