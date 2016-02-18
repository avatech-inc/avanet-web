module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            src: 'src/**/*.js',
            options: {
                host: 'http://localhost:8888/',
                outfile: 'SpecRunner.html'
            }
        }
    })

    grunt.loadNpmTasks('grunt-contrib-jasmine')

    grunt.registerTask('default', ['jasmine'])
}
