
var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')

var DEV = process.env.NODE_ENV === 'development'
var STAGE = process.env.NODE_ENV === 'stage'
var PROD = process.env.NODE_ENV === 'production'

var VERSION = 'dev'

/*
 * Source maps are available automatically on dev and stage. Source maps are
 * uploaded to Sentry on prod.
 */
if (PROD) {
    VERSION = process.env.VERSION
}

var entry = {
    js: ['./src/index.js'],
    css: ['./src/sass.js'],

    /**
     * Vendor libraries are split between node_modules and src/vendor while
     * libraries are migrated to npm dependencies. More on this below.
     */
    vendor: [
        'jquery',
        'underscore',
        'angular',
        'd3',
        'moment',
        'angular-moment',
        'leaflet',
        'turf',
        'simplify-js',
        './src/vendor/jquery.autosize.js',
        './src/vendor/canvg/rgbcolor.js',
        './src/vendor/canvg/StackBlur.js',
        './src/vendor/canvg/canvg.js',
        './src/vendor/leaflet.draw-src.js',
        './src/vendor/leaflet.contextmenu-src.js',
        './src/vendor/zlib.js',
        './src/vendor/png.js',
        './src/vendor/utm.js',
        './src/vendor/greatCircle.js',
        './src/vendor/WorldMagneticModel.js',
        './src/vendor/DrawDeclinationCanvas.js',
        './src/vendor/PruneCluster.js',
        './src/vendor/leaflet-heat.js',
        './src/vendor/leaflet-image.js',
        './src/vendor/leaflet_canvas_layer.js',
        './src/vendor/graticule.js',
        './src/vendor/angular-cookies/angular-cookies.js',
        './src/vendor/angular-route/angular-route.js',
        './src/vendor/angular-touch/angular-touch.js',
        './src/vendor/restangular/dist/restangular.js',
        './src/vendor/objectpath/lib/ObjectPath.js',
        './src/vendor/tv4/tv4.js',
        './src/vendor/angular-sanitize/angular-sanitize.js',
        './src/vendor/angular-schema-form/dist/schema-form.js',
        './src/vendor/angular-schema-form/dist/bootstrap-decorator.js',
        './src/vendor/angular-bindonce/bindonce.js',
        './src/vendor/jquery.mentionsInput.js',
        './src/vendor/jquery.elastic.js',
        './src/vendor/jquery.knob.js',
        './src/vendor/jspdf/dist/jspdf.debug.js',
        './src/vendor/pdfmake/build/pdfmake.js',
        './src/vendor/pdfmake/build/vfs_fonts.js',
        './src/vendor/angular-local-storage/angular-local-storage.js',
        './src/vendor/angular-country-picker/country-picker.js',
        './src/vendor/angular-translate/angular-translate.js',
        './src/vendor/angular-translate-loader-partial/angular-translate-loader-partial.js',
        './src/vendor/angular-ui-router/release/angular-ui-router.js',
        './src/vendor/angular-ui-utils/modules/route/route.js',
        './src/vendor/ui-router-extras/release/ct-ui-router-extras.js',
        './src/vendor/ui-bootstrap-0.14.3.js',
        './src/vendor/ui-bootstrap-tpls-0.14.3.js',
        './src/vendor/angular-credit-cards/release/angular-credit-cards.js',
        './src/vendor/venturocket-angular-slider/build/angular-slider.js',
        './src/vendor/bootstrap.js',
        './src/vendor/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox.js',
        './src/vendor/elevation-widget.js',
        './src/vendor/ngjs-color-picker/js/ngjs-color-picker.js',
        './src/vendor/angular-audio/app/angular.audio.js',
        './src/vendor/nanoscroller/bin/javascripts/jquery.nanoscroller.js',
        './src/vendor/angular-nanoscroller/scrollable.js',
        './src/vendor/pikaday/pikaday.js',
        './src/vendor/pikaday-angular/pikaday-angular.js',
        './src/vendor/FileSaver.js',
        './src/vendor/canvas-toBlob.js'
    ]
}

var plugins = [
    /**
     * Extract the completed CSS to a single file.
     */
    new ExtractTextPlugin('avanet.css'),

    /**
     * Vendor bundle. Passing Infinity makes CommonsChunkPlugin include all
     * of the files in the vendor entry.
     */
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js', Infinity),

    /**
     * __DEV__ and __PROD__ are two feature flags used in the codebase to
     * enable/disable features like analytics and debugging.
     */
    new webpack.DefinePlugin({
        __DEV__: (DEV),
        __STAGE__: (STAGE),
        __PROD__: (PROD),
        __VERSION__: JSON.stringify(VERSION)
    }),

    /**
     * A list of globals sprinkled through the codebase. These resolve to
     * require() in webpack and make transitioning to require() much easier.
     */
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        _: 'underscore',
        moment: 'moment',
        PruneCluster: 'PruneCluster',
        L: 'leaflet',
        UTM: 'utm',
        turf: 'turf',
        simplify: 'simplify-js',
        UTMGridLayer: 'graticule',
        Arc: 'greatCircle',
        DrawDeclinationCanvas: 'DrawDeclinationCanvas',
        WorldMagneticModel: 'WorldMagneticModel',
        leafletImage: 'leaflet-image'
    }),

    /**
     * A couple static files that aren't require()'d in the codebase, but still
     * need to be copied to build. For the webpack-dev-server, webpack has to
     * be run first to copy these to the build directory (CopyWebpackPlugin files
     * are not available in the in-memory server).
     *
     * The views/ HTML files are copied for now. The 500 and 503 files won't be
     * needed once the static files are off Heroku. The download-app file
     * will be moved to an Angular view.
     */
    new CopyWebpackPlugin([
        { from: './src/img', to: '../img' },
        { from: './src/translate', to: '../translate' },
        { from: './src/views', to: '../views' },
        { from: './src/index.html', to: '../index.html' }
    ])
];

if (PROD) {
    /**
     * Only run Uglify in prod. TODO: Only mangle the codebase, and not the
     * vendor libs.
     */
    var uglify = new webpack.optimize.UglifyJsPlugin({
        mangle: false
    });

    plugins.unshift(uglify);
}

module.exports = {
    entry: entry,
    module: {
        loaders: [
            /**
              * Load SASS and CSS with source maps. CSS is then extracted with
              * ExtractTextPlugin below. css-loader and sass-loader options are
              * defined below.
              */
            {
                test: /\.(css|scss)$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader')
            },

            {
                test: /\.ts$/,
                loader: 'ts-loader'
            },

            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                include: [
                    path.resolve(__dirname, 'src', 'js'),
                    path.resolve(__dirname, 'src', 'modules')
                ]
            },

            /**
              * Add Angular HTML templates to JS template cache.
              */
            {
                test: /\.html$/,
                loader: 'ngtemplate?relativeTo=' + (path.resolve(__dirname, './src')) + '!raw'
            },

            /**
              * URL loader for static files (mostly fonts). Inlining is disabled for
              * now.
              */
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)/,
                loader: 'url-loader?limit=1'
            },

            /**
             * jsPDF uses RequireJS. God help us. Including it raw.
             */
            { test: /jspdf/, loader: 'script-loader' },

            /**
             * Several 'vendor' libraries expect to use the global namespace.
             */
            { test: /WorldMagneticModel/, loader: 'exports-loader?WorldMagneticModel' },
            { test: /DrawDeclinationCanvas/, loader: 'exports-loader?DrawDeclinationCanvas' },
            { test: /greatCircle/, loader: 'exports-loader?Coord,Arc,GreatCircle' },
            { test: /graticule/, loader: 'exports-loader?UTMGridLayer' },
            { test: /utm.js/, loader: 'exports-loader?latLonToUTMXY,utmXYToLatLon,degToRad,radToDeg' },
            { test: /PruneCluster/, loader: 'exports-loader?PruneCluster,PruneClusterForLeaflet' },
        ],

        /**
         * MomentJS requires 50 optional language files if it's parsed by webpack.
         * Issue described here: https://github.com/webpack/webpack/issues/198
         * There's a couple other options to resolve this, this is the easiest to
         * implement now.
         */
        noParse: [
            /moment\/moment.js/
        ]
    },
    plugins: plugins,
    output: {
        path: path.resolve(__dirname, 'build', 'assets'),
        publicPath: '/assets/',

        /**
         * Currently only two entries use the output, js and css.
         * TODO: refactor the entries and not use the entry name as file extension.
         */
        filename: 'avanet.[name]',

        sourceMapFilename: '[file].map',

        devtoolLineToLine: {
            test: '/\/vendor\//',
            include: false
        }
    },

    /**
     * style-loader and sass-loader options.
     */
    styleLoader: {
        sourceMap: true
    },
    sassLoader: {
        includePaths: [path.resolve(__dirname, './src')],
        outputStyle: 'expanded',
        sourceMap: true,
        sourceMapContents: true
    },

    /**
     * Set the source map
     */
    devtool: 'source-map',

    /**
     * historyApiFallback lets Angular routing kick in when the URLs are not
     * found in the in-memory server or files. Two /app URLs are proxied directly
     * to HTML files. These will be moved to Angular routes at some point, like
     * /support.
     */
    devServer: {
        historyApiFallback: true,
        contentBase: 'build/',
        proxy: {
            '/app': {
                target: 'http://localhost:8080/',
                bypass: function (req, res, proxyOptions) {
                    return '/views/download-app.html';
                }
            },
            '/download-app': {
                target: 'http://localhost:8080/',
                bypass: function (req, res, proxyOptions) {
                    return '/views/download-app.html';
                }
            }
        }
    },

    /**
     * Eventually, the libraries in src/vendor will be moved to node_modules.
     * Until then, require() looks in src and node_modules, and falls back to
     * src/vendor last. This lets us continously migrate libraries out of
     * src/vendor.
     */
    resolve: {
        extensions: ['', '.ts', '.js', '.css', '.scss', '.html'],
        modulesDirectories: ['src', 'node_modules', 'src/vendor'],
        alias: {
            schemaForm: 'angular-schema-form/dist/schema-form'
        }
    }
}
