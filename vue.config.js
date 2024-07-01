const path = require("path");

const webpack = require("webpack");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = ["js", "css"];

// const env = {
//   APP_VERSION: JSON.stringify(process.env.APP_VERSION)
// };

module.exports = {
  publicPath: "/",
  outputDir: "dist",
  lintOnSave: true,
  productionSourceMap: false,
  parallel: require("os").cpus().length > 1,
  devServer: {
    open: false,
    host: "0.0.0.0",
    port: 8089,
    client: {
      overlay: {
        warnings: true,
        errors: true,
      },
    },
    allowedHosts: "all",
    proxy: {
      "/prod-api": {
        target: "https://dev-endpoint-portal-ccb-itrmch.yunupay.com", //测试环境
        // target: "http://192.168.1.20:9090",
        changeOrigin: true,
        pathRewrite: {
          "/prod-api": "",
        },
      },
      // "/wss": {
      //   target: "wss://dev-keepalive-itrmch.yunupay.com", // WebSocket 服务器地址
      //   ws: true,
      //   changeOrigin: true,
      //   pathRewrite: {
      //     "^/ws": "",
      //   },
      // },
    },
  },
  configureWebpack: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@i": path.resolve(__dirname, "./src/assets"),
      },
    },
    plugins: [
      // new webpack.DefinePlugin({
      //   'process.env': env
      // }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
      new CompressionWebpackPlugin({
        algorithm: "gzip",
        test: new RegExp("\\.(" + productionGzipExtensions.join("|") + ")$"),
        threshold: 10240,
        minRatio: 0.8,
      }),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 5,
      }),
    ],
  },
};
