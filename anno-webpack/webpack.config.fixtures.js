const webpack = require('webpack');
const path = require('path');

const config = {
    entry: 'json-loader!../anno-fixtures/index.json',
    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: 'anno-fixtures.js',
        library: ['Anno', 'fixtures']
    },
};

module.exports = config;
