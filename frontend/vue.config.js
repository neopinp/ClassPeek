const path = require('path');
const { SERVER_URL } = require('../shared/config');

module.exports = {
  // Specifies where to build our files for production
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false, // Disable source maps in production
  // This ensures that our API requests can still work even if we are running locally
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: SERVER_URL, // Proxy API requests to Express backend
        changeOrigin: true,
      },
    },
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@config': path.resolve(__dirname, '../shared/config.js'),
      },
    },
  },
};