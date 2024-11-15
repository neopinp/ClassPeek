module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false, // Disable source maps in production
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