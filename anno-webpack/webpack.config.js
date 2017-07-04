const webpack = require('webpack');
const path = require('path');

// detect if webpack bundle is being processed in a production or development env
let prodBuild = require('yargs').argv.p || false;

const config = {
    entry: {
        core: './entry.js',
    },
    node: { fs: "empty" },
    // externals: {
    //     'ajv': 'ajv',
    // },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: `anno${prodBuild ? '.min' : ''}.js`,
        library: 'Anno',
        libraryTarget: 'umd'
    },
    resolve: {
        unsafeCache: true,
        alias: {
            'ajv': 'ajv/dist/ajv.min.js',
            'async': 'async/dist/async.min.js'
            // 'nedb': 'nedb/browser-version/out/nedb.min.js',
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules\/(?!(envyconf|@kba\/anno))/,
                loader: 'babel-loader',
            }
        ]
    },
    devtool: prodBuild ? 'source-map' : 'eval-source-map',
    // plugins: [
    //     new webpack.optimize.CommonsChunkPlugin({
    //         name: 'vendor',
    //         minChunks: function (module) {
    //             // this assumes your vendor imports exist in the node_modules directory
    //             return module.context && module.context.indexOf('node_modules') !== -1;
    //             // return module.context && (
    //             //     module.context.indexOf('async') !== -1
    //             //     || module.context.indexOf('ajv') !== -1
    //             //     || module.context.indexOf('nedb') !== -1
    //             //     || module.context.indexOf('localforage') !== -1
    //         }
    //     }),
    // ]
};

module.exports = config;
