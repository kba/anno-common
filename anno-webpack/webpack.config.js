const webpack = require('webpack');
const path = require('path');

const config = {
    entry: './entry.js',
    node: { fs: "empty" },
    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: 'anno.js',
        library: 'Anno'
    },
    resolve: {
        unsafeCache: true,
    },
    module: {
        rules: [
            {
                test: /anno-.*\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader?cacheDirectory',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    }
};

module.exports = config;
