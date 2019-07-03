

import path from "path"
const buildPath = path.resolve(__dirname, "build");
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";

const config: webpack.Configuration = {
  entry: {
    app: path.resolve(__dirname, "./index.tsx")
  },
  mode: "development",
  output: {
    path: buildPath,
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      name: "vendors",

    },
    runtimeChunk: "single"
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],

  },
  devServer: {
    port: 9090,
    inline: true,
    overlay: true,
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "react-vmage-example",
      chunks: ["runtime", "vendors", "app"],
      template: path.resolve(__dirname, "./index.html")
    })
  ]
}

export default config
