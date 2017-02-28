const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractCss = new ExtractTextPlugin('css/[name].css');

module.exports = {
  devtool: 'source-map',
  entry: {
    app: ['babel-polyfill', './src/js/app'],
    style: './src/scss/style.scss'
  },
  output: {
    filename: 'js/[name].js',
    path: `${__dirname}/build`
  },
  externals: {
    csinterface: 'CSInterface',
    csevent: 'CSEvent'
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
