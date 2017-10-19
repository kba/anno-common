require('webpack')
const path = require('path')

// detect if webpack bundle is being processed in a production or development env
let prodBuild = require('yargs').argv.p || false

const config = {
    entry: './AnnoMemoryStore.js',
    node: {fs: "empty"},
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: `anno-memory-store${!prodBuild ? '.dev' : ''}.js`,
        library: 'AnnoMemoryStore',
        libraryTarget: 'umd'
    },
    resolve: {
        unsafeCache: true,
        alias: {
            'async': 'async/dist/async.min.js',
            'nedb': 'nedb/browser-version/out/nedb.min.js',
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
}

module.exports = config
