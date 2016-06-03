
var path = require('path')

module.exports = {
    entry: {
        test: [
            'es6-promise',
            'isomorphic-fetch',

            './spec/lib/upload.spec.js',
            './spec/lib/billing.spec.js'
        ]
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            },

            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader'
            }
        ]
    },

    output: {
        path: path.resolve(__dirname),
        publicPath: '/',

        filename: 'bundle.js'
    },

    devServer: {
        contentBase: path.resolve(__dirname),
        port: 8888
    },

    resolve: {
        extensions: ['', '.ts', '.js'],
        modulesDirectories: ['spec', 'node_modules'],
    }
}
