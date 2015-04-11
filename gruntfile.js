module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
          build: {
            //src: ['app/**','config/**','node_modules/**','package.json','server.js','routes.js','public/**','!public/css/**','!public/js/**','!public/lib/**','!public/sass/**'],
            src: ['app/**','config/**','node_modules/**','package.json','server.js','public/**','!public/css/**','!public/js/**/*','!public/lib/**','!public/sass/**'],
            dest: '_dist/'
          },
          // routes: {
          //   src: 'routes.js',
          //   dest: 'public/js/'
          // }
        },
        watch: {
            html: {
                files: ['public/views/**'],
                options: {
                    livereload: true,
                },
            },
            modules: {
                //files: ['public/js/**'],
                files: ['public/modules/**'],
                options: {
                    livereload: true,
                    event: ['all']
                },
            },
            js: {
                //files: ['public/js/**'],
                files: ['public/js/**'],
                options: {
                    livereload: true,
                    event: ['all']
                },
            },
            // compile sass/compass in real time
            css: {
                files: ['public/sass/**'],
                tasks: ['compass'],
                options: {
                    livereload: true,
                    force: true
                }
            },
            // rebuild main.html when scripts or styles are added or removed (which will trigger nodemon restart)
            scriptAndStyleChange: {
                files: ['public/js/controllers/**/*','public/js/services/**','public/js/directives/**', 'public/css/**'],
                tasks: ['buildMain'],
                options: { 
                    event: ['added', 'deleted'],
                    livereload: true,
                },
            },
            // rebuild main.html when routes.js is changed (which will trigger nodemon restart)
            // routes: {
            //     files: ['routes.js'],
            //     tasks: ['buildMain'],
            //     options: { livereload: true },
            // },
        },
        jshint: {
            all: ['gruntfile.js']
        },
        compass: { //Task
            dist: { //Target
                options: { //Target options
                    sassDir: 'public/sass',
                    cssDir: 'public/css',
                    environment: 'production'
                }
            },
            dev: { //Another target
                options: {
                    sassDir: 'public/sass',
                    cssDir: 'public/css'
                }
            }
        },
        nodemon: {
            dev: {
                options: {
                    file: 'server.js',
                    args: [],
                    ignoredFiles: ['routes.js','/node_modules/*','/public/*'],
                    watchedExtensions: ['js','html'],
                    //watchedFolders: ['app', 'config'],
                    debug: true,
                    delayTime: 2,
                    env: { PORT: 3000 },
                    cwd: __dirname
                }
            },
            exec: {
                options: {
                    exec: 'less'
                }
            }
        },
        concurrent: {
            target: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        tags: {
            scripts: {
                options: {
                    scriptTemplate: '<script src="/{{ path }}"></script>',
                    openTag: '<!-- start app scripts -->',
                    closeTag: '<!-- end app scripts -->'
                },
                src: [
                    'public/modules/**/*.js',

                    'public/js/services/*.js',
                    'public/js/controllers/*.js',
                    'public/js/controllers/*/*.js',
                    'public/js/directives/*.js',
                    'public/js/directives/*/*.js'
                ],
                dest: 'app/views/main.html'
            },
            styles: {
                options: {
                    linkTemplate: '<link rel="stylesheet" href="/{{ path }}">',
                    openTag: '<!-- start app styles -->',
                    closeTag: '<!-- end app styles -->'
                },
                src: [
                    'public/css/**',
                ],
                dest: 'app/views/main.html'
            }
        },
        // replace: {
        //   dist: {
        //     options: {
        //       patterns: [
        //         {
        //           match: 'routes',
        //           replacement: grunt.file.read('routes.js')
        //         }
        //       ]
        //     },
        //     files: [
        //       { src: ['app/views/main.html'], dest: 'app/views/_main.html' }
        //     ]
        //   }
        // },

        usemin: {
           html: '_dist/app/views/main.html'
        },
        useminPrepare: {
            html: '_dist/app/views/main.html',
            options: {
              root: 'public/',
              dest: '_dist/public/'
         }
        },
        targethtml: {
          build: {
            files: {
              '_dist/app/views/main.html': '_dist/app/views/main.html'
            }
          }
        }
    });

    // load npm tasks 
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    //grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-targethtml');
    grunt.loadNpmTasks('grunt-script-link-tags');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-git');

    // make grunt default to force in order not to break the project.
    grunt.option('force', true);

    // register tasks
    grunt.registerTask('min',['useminPrepare','concat','uglify','cssmin','usemin']);
    //grunt.registerTask('buildMain', ['copy:routes', 'tags']);
    //grunt.registerTask('buildMain', ['tags']);

    grunt.registerTask('default', ['tags', 'jshint', 'compass', 'concurrent:target']);

    grunt.registerTask('build', [
        // compile sass into css
        'compass',
        // load scripts and styles into main.html
        'tags', 
        // copy files to _dist folder
        'copy:build', 
        // remove dev-specific code sections from main.html
        'targethtml:build', 
        // combine and minify scripts and styles
        'min', 
        // lint it
        'jshint'
    ]);


};
