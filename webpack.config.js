const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractCss = new ExtractTextPlugin('css/[name].css');

module.exports = {
  devtool: 'inline-source-map',
  entry: {
    app: './src/js/app',
    style: './src/scss/style.scss'
  },
  output: {
    filename: 'js/[name].js',
    path: `${__dirname}/build`
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        use: 'source-map-loader'
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|lib)/,
        use: 'babel-loader'
      },
      {
        test: /\.scss$/,
        use: extractCss.extract({
          use: ['css-loader', 'sass-loader']
        })
      }
    ]
  },
  plugins: [
    extractCss
  ]

};
