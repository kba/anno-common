const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const config = {
    entry: './index.js',
    // node: {
    //     fs: "empty"
    // },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'my-first-webpack.bundle.js'
    },
    module: {
        rules: [
            {test: /\.(js|jsx)$/, use: 'babel-loader'}
        ]
    },
    devtool: "#inline-source-map",
    plugins: [
        // new webpack.optimize.UglifyJsPlugin(),
        new HtmlWebpackPlugin({template: './template/index.html'})
    ]
};

module.exports = config;
