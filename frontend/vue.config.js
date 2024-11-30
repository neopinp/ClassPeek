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
        target: 'http://localhost:3000', // Proxy API requests to Express backend
        changeOrigin: true,
      },
    },
  },
};