const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './src/server.js'),
  mode: 'production',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'server.js'
  },
  resolve: {
    extensions: ['.js'],
  },
  externals: ['pg', 'sqlite3', 'tedious', 'pg-hstore']
}