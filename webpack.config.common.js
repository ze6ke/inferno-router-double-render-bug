module.exports = {
  //devtool: '#source-map',
  //devtool: 'inline-source-map',
  module: {
    rules: [
      { test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'stage-3'],
            plugins: ['inferno']
          }
        }
      }
    ]
  }
}
