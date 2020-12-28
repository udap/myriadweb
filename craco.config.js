const path = require("path");
const CracoLessPlugin = require("craco-less");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");

module.exports = {
  webpack: {
    module: {
      rules: [
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: "babel-loader",
            },
            {
              loader: "@svgr/webpack",
              options: {
                babel: false,
                icon: true,
              },
            },
          ],
        },
      ],
    },
    // 别名
    alias: {
      "@": path.resolve("src"),
      "@api": path.resolve("src/api"),
      "@assets": path.resolve("src/assets"),
      "@components": path.resolve("src/components"),
      "@css": path.resolve("src/css"),
      "@routes": path.resolve("src/routes"),
      "@utils": path.resolve("src/utils"),
      "@views": path.resolve("src/views"),
    },
    plugins: [
      // 查看打包的进度
      new SimpleProgressWebpackPlugin(),
    ],
  },
  babel: {
    plugins: [
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      [
        "import",
        {
          libraryName: "antd",
          libraryDirectory: "es",
          style: true, //设置为true即是less
        },
      ],
    ],
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              "@primary-color": "#34B4AC", // 全局主色
              "@link-color": "#34B4AC", // 链接色
              "@success-color": "#52c41a", // 成功色
              "@warning-color": "#faad14", // 警告色
              "@error-color": "#f5222d", // 错误色
              "@font-size-base": "14px", // 主字号
              "@heading-color": "rgba(0, 0, 0, 0.85)", // 标题色
              "@text-color": "rgba(0, 0, 0, 0.65)", // 主文本色
              "@text-color-secondary": "rgba(0, 0, 0, 0.45)", // 次文本色
              "@disabled-color": "rgba(0, 0, 0, 0.25)", // 失效色
              "@border-radius-base": "4px", // 组件/浮层圆角
              "@border-color-base": "#d9d9d9", // 边框色
              "@box-shadow-base": "0 2px 8px rgba(0, 0, 0, 0.15)", // 浮层阴影
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  devServer: {
    port: 3000,
    compress: false,
    proxy: {
      "/myriadapi": {
        // support
        // target: "https://myriad-support.xinongtech.com/",
        // test
        // target: "https://myriad-test.xinongtech.com/",
        target: "https://myriadweb-test.chainmind.xyz",
        changeOrigin: true,
      },
    },
  },
};
