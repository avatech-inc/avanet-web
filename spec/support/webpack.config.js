
var path = require('path')

module.exports = {
    entry: {
        test: [
            './spec/lib/upload.spec.js'
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
