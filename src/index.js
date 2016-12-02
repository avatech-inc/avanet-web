
require('babel-polyfill')

require('./js/app')
require('./js/init')

// if (__PROD__) {
//     require('./vendor/raven/raven.min.js')
// }

if (__STAGE__ || __PROD__) {
    require('./js/analytics')
}
