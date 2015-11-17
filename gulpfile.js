var gulp = require('gulp');
var path = require('path');
var fs = require("fs");
var nodemon = require('gulp-nodemon');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var inject = require('gulp-inject');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var runSequence = require('run-sequence');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var replace = require('gulp-replace-task');
var gutil = require('gulp-util');
var argv = require('yargs').argv;
//var rollbar = require('gulp-rollbar');
var stripDebug = require('gulp-strip-debug');
var rename = require("gulp-rename");
var htmlmin = require('gulp-htmlmin');

var s3 = require("gulp-s3");
var aws = {
    key: 'AKIAIQFLR4EQC63ZZTNQ'
  , secret: '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'
  , bucket: 'avanet'
};

gulp.task('upload-s3', function() {
  return gulp.src('server/views/503-maint.html', { read: true})
    .pipe(s3(aws, { headers: { 'x-amz-acl': 'public-read' } }));
});
// https://devcenter.heroku.com/articles/error-pages#customize-pages
gulp.task('push-error-pages', ['upload-s3'], function(done){
    var error_url = "//s3.amazonaws.com/avanet/503-maint.html";
    var maint_url = "//s3.amazonaws.com/avanet/503-maint.html";

  exec("heroku config:set ERROR_PAGE_URL=" + error_url + " MAINTENANCE_PAGE_URL=" + maint_url + " --app avanet", {cwd: process.cwd }, function(err, stdout, stderr){
      gutil.log(stderr);
      gutil.error(stdout);
      done();
     });
});
 

gulp.task('clean-css', function() {
  return gulp.src('public/css', {read: false})
        .pipe(clean({ force: true }));
})
gulp.task('compass', ['clean-css'], function() {
  return gulp.src(['public/sass/**/*.scss','public/modules/**/*.scss'])
        .pipe(sass({ errLogToConsole: true }))
        .pipe(gulp.dest('public/css'));
});


gulp.task('ng-annotate', function() {

  return gulp.src([
    '_dist/public/js/**/*.js',
    '_dist/public/modules/**/*.js',
    '!_dist/public/js/lib'
  ])
  .pipe(ngAnnotate())
  .pipe(gulp.dest(function(file) {
    return file.base;
  }));

});

gulp.task('strip-debug', function() {

  return gulp.src([
    '_dist/public/js/**/*.js',
    '_dist/public/modules/**/*.js',
    '!_dist/public/js/lib',
  ])
  .pipe(stripDebug())
  .pipe(gulp.dest(function(file) {
    return file.base;
  }));

});

gulp.task('combine', function() {

    return gulp.src('_dist/server/views/main.html')
    .pipe(replace({
        patterns: [{ match: 'env', replacement: 'production' }]
    }))

    .pipe(useref({ searchPath: '_dist/public' }))

    // minify CSS
    .pipe(gulpif('*.css', minifyCSS({ keepSpecialComments: 0 })))

    // rename the concatenated files for cache-busting
    .pipe(rev())             
    // substitute in new filenames in main.html
    .pipe(revReplace())      

    // sourcemaps
    // .pipe(rollbar({
    //   accessToken: '887db6d480c74bab9cee4ab6376f1545',
    //   version: 'version_test',
    //   sourceMappingURLPrefix: 'https://avanet.avatech.com'
    // }))
    //.pipe(gulpif('*.js', sourcemaps.write('./')))

    // add all assets to dist folder
    .pipe(gulpif('*.css', gulp.dest('_dist/public')))
    .pipe(gulpif('*.js', gulp.dest('_dist/public')))
    //.pipe(gulpif('*.map', gulp.dest('_dist/public')))

    .pipe(gulpif('*.html', rename("main.html")))
    .pipe(gulpif('*.html', gulp.dest('_dist/server/views')))
});

gulp.task('uglify', function() {
  return gulp.src(['_dist/public/assets/*.js'])
  .pipe(uglify())
  .pipe(gulp.dest('_dist/public/assets'));
});

gulp.task('clean-html', function() {
  return gulp.src('_dist/server/views/main.html')
    .pipe(htmlmin({ 
      removeComments: true,
      collapseWhitespace: true,
      preserveLineBreaks: true
    }))
    .pipe(gulp.dest(function(file) {
      return file.base;
    }));
});

gulp.task('clean-dist', function() {
  return gulp.src([
    '_dist/public/modules/**/*.js',
    '_dist/public/lib',
    '_dist/public/js',
    '_dist/public/css',
    '_dist/public/sass',
    ], { read: false })
      .pipe(clean({ force: true }));
})

gulp.task('buildMain', function () {
  var target = gulp.src('server/views/main.html');

  var sources = gulp.src([
	  'public/modules/**/*.js',
    'public/js/services/*.js',
    'public/js/controllers/*.js',
    'public/js/controllers/*/*.js',
    'public/js/directives/*.js',
    'public/js/directives/*/*.js',
    'public/css/**/*.css',
  ],
  // don't read the file contents - we only need filenames
  {read: false});
 
  return target.pipe(inject(sources,{
        ignorePath: 'public/',
        addRootSlash: true,
    }))
    .pipe(gulp.dest('server/views'));
});

gulp.task('clean', function() {
	return gulp.src('_dist', {read: false})
        .pipe(clean({ force: true }));
})

// copy files to dist folder
gulp.task('copy', function() {
   return gulp.src(
   	['server/**/*',
    'package.json','server.js','newrelic.js',
    'public/**',
   	]
   	, { base: './' })
   .pipe(gulp.dest('_dist'));
});

gulp.task('lint',function(){
 return gulp.src(['public/js/**/*.js','!public/js/lib/*.js'])
  .pipe(jshint())
  .pipe(jshint.reporter('default'))
  .pipe(jshint.reporter('fail'))
  ;
  // .pipe(jscs({
  //   //preset: "airbnb",
  //   //ignoreEmptyLines: true,
  //   //disallowTrailingWhitespace: false,
  //   validateQuoteMarks: "'"
  // }));

})

// git stuff

gulp.task('remove-git', function() {
	return gulp.src('_dist./git', {read: false})
        .pipe(clean({ force: true }));
})

var exec = require("child_process").exec;
var spawn = require('child_process').spawn;

gulp.task('git', ['remove-git'], function(done){
		
    process.chdir('_dist');

	exec("git init", {cwd: process.cwd }, function(err, stdout, stderr){
   		gutil.log("Git: repository initialized");

		exec("git add .", {cwd: process.cwd }, function(err, stdout, stderr){
       		//console.log(stdout);
       		gutil.log("Git: files added");

			exec("git commit -m '-'", {cwd: process.cwd }, function(err, stdout, stderr) {
	       		//console.log(stdout);
	       		gutil.log("Git: files committed");

    			process.chdir('../');

	       		done();
			});
		});
     });
});

gulp.task('deploy', function(done){
	fs.exists("_dist",function(exists){

		if (!exists) {
			gutil.error(gutil.colors.red("dist folder does not exist. run 'gulp build' first."));
    		done();
    		return;
		}
		
	    process.chdir('_dist');

	    var remotes = {
        "avanet": "git@heroku.com:avanet.git",
        "avanet-demo": "git@heroku.com:avanet-demo.git",
        "avanet-demo2": "git@heroku.com:avanet-demo2.git"
      } 
      //var remote = "production"; var app = "avanet";
      var app = "avanet-demo2";
      
      if (argv.to) app = argv.to;

	    exec("git remote rm " + app, {cwd: process.cwd }, function(err, stdout, stderr){
			exec("git remote add " + app + " " + remotes[app], {cwd: process.cwd }, function(err, stdout, stderr){
	       		//console.log(stdout);
	   			gutil.log("git remote added");

					exec("heroku config:set NODE_ENV=production -app " + app, {cwd: process.cwd }, function(err, stdout, stderr){

		       		console.log(stdout);
		       		gutil.log("Pushing to '" + app + "'")
              console.log();

					var heroku = spawn("git",["push" , app, "master", "-f"], { cwd: process.cwd })

					heroku.stdout.on('data', function (data) { 
            console.log("" + data);
          });
					heroku.stderr.on('data', function (data) { 
            console.log("" + data); 
            if ((data + "").indexOf("master -> master ") != -1) {
              console.log(); console.log();
              gutil.log(gutil.colors.green("DEPLOY SUCCESS TO '" + app + "'"));
              console.log(); console.log();
            }
          });

					heroku.on('exit', function (code) { done(); });
				});
			});
		});
	});
});

gulp.task('build', function(done) {
  runSequence('compass',
    // inject files into main
    'buildMain',
    // remove existing _dist folder
    'clean', 
    // copy files into _Dist
    'copy',
    // strip out 'console.log' etc.
    'strip-debug',
    // add angular [] annotations
    'ng-annotate',
    // concat files
    'combine', 
    // clean main.html
    'clean-html',
    // uglify javascript
    'uglify',
    // cleanup files
    'clean-dist', 
    // prepare git for heroku
    'git',
  done);
});

gulp.task('start', function(done) {
  runSequence('compass','buildMain','start2', done);
});

// gulp.task('start2', function(done) {
//  //gulp.watch(['public/sass/**/*.scss','public/modules/**/*.scss',], ['compass']);
//   // todo:
//   // - livereload when public changes 'public/**/*'
//   // - buildMain when js folder changes?
//    nodemon({
//     script: 'server.js'
//   , ext: 'js html'
//   //, watch: ['public','app','config', '!public/tiles']
//   //, verbose: true
//   //, ignore: ['public/tiles','public/tiles2','tmp/*','/_dist','/_dist','/.sass-cache','/.tmp']
//   , env: { 'NODE_ENV': 'development' }
//   });
// });

gulp.task('start-dist', function(done) {
    process.chdir('_dist');

    // todo: no need for nodemon here since we aren't editing
   nodemon({
    script: 'server.js'
  , ext: 'js html'
  , env: { 'NODE_ENV': 'development' }
  })
});

gulp.task('build-deploy', function(done) {
  runSequence('build','deploy', done);
});
