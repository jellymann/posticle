const { default: VueLoaderPlugin } = require('vue-loader/dist/plugin');

module.exports = {
  renderer: {
    entry: './src/renderer/javascripts/index.js',
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.s[ac]ss$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                additionalData: '@import "preload";',
                sassOptions: {
                  includePaths: ['./src/renderer/stylesheets']
                }
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin()
    ]
  },
  preload: {
    entry: './src/preload/index.js'
  },
  main: {
    entry: './src/main/index.js'
  }
}
