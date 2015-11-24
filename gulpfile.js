var gulp = require('gulp');
var fs = require("fs");
var nodemon = require('gulp-nodemon');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var inject = require('gulp-inject');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var runSequence = require('run-sequence');
var rev = require('gulp-rev');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var replace = require('gulp-replace-task');
var gutil = require('gulp-util');
var argv = require('yargs').argv;
var htmlmin = require('gulp-htmlmin');
var insert = require('gulp-insert');
var concat = require('gulp-concat');
var htmlreplace = require('gulp-html-replace');
var bump = require('gulp-bump');
var tap = require('gulp-tap');
//var stripDebug = require('gulp-strip-debug');

var s3 = require("gulp-s3");
var aws = {
    key: 'AKIAIQFLR4EQC63ZZTNQ'
  , secret: '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'
  , bucket: 'avanet'
};

// ----------------------------------------------------------------------------------

  var bundleName = "avanet";
  var releaseVersion;

  var _sources = [
    // libraries

    // Leaflet
    'public/js/lib/leaflet.js',
    // Leaflet Draw
    'public/js/lib/leaflet.draw-src.js',
    // PNG processing
    'public/js/lib/zlib.js', 
    'public/js/lib/png.js', 
    // UTM-lat/lng conversion
    'public/js/lib/utm.js', 
    // great circle math
    'public/js/lib/greatCircle.js', 
    // world magnetic model
    'public/js/lib/WorldMagneticModel.js', 
    // DrawDeclinationCanvas
    //'public/js/lib/DrawDeclinationCanvas.js', 
    // DrawScaleCanvas
    //'public/js/lib/DrawScaleCanvas.js', 
    // underscore
    'public/lib/underscore/underscore.js', 
    // Leaflet PruneCluster plugin
    'public/js/lib/PruneCluster.js',
    // Leaflet Heatmap plugin
    'public/js/lib/leaflet-heat.js',
    // Leaflet Image Export plugin
    'public/js/lib/leaflet-image.js',
    // Leaflet Canvas Layer plugin
    'public/js/lib/leaflet_canvas_layer.js',
    // turf.js
    'public/js/lib/turf.js',
    // simplify.js
    'public/js/lib/simplify.js',
    // Leaflet Graticule
    'public/js/lib/graticule.js',
    // Angular
    'public/lib/angular/angular.js',
    'public/lib/angular-cookies/angular-cookies.js',
    'public/lib/angular-route/angular-route.js',
    'public/lib/angular-touch/angular-touch.js',
    // Restangular
    'public/lib/restangular/dist/restangular.js',
    // angular forms
    'public/lib/objectpath/lib/ObjectPath.js',
    'public/lib/tv4/tv4.js',
    'public/lib/angular-sanitize/angular-sanitize.js',
    'public/lib/angular-schema-form/dist/schema-form.js',
    'public/lib/angular-schema-form/dist/bootstrap-decorator.js',
    // bindonce
    'public/lib/angular-bindonce/bindonce.js',
    // mentions input
    'public/js/lib/jquery.mentionsInput.js',
    'public/js/lib/jquery.elastic.js',
    // ment.io
    'public/lib/ment.io/dist/mentio.js', // <--- still used?
    // suncalc
    //'public/js/lib/suncalc.js',
    // moment.js time formatter
    'public/lib/moment/moment.js',
    // angular wrapper for moment.js
    'public/lib/angular-moment/angular-moment.js',
    // jQuery Knob
    'public/js/lib/jquery.knob.js',
    // md5
    'public/lib/blueimp-md5/js/md5.js',
    // jsPDF
    'public/lib/jspdf/dist/jspdf.debug.js',
    // pdfmake
    'public/lib/pdfmake/build/pdfmake.js',
    'public/lib/pdfmake/build/vfs_fonts.js',
    // Angular local storage
    'public/lib/angular-local-storage/angular-local-storage.js',
    // Angular country picker
    'public/lib/angular-country-picker/country-picker.js',
    // Angular Translate
    'public/lib/angular-translate/angular-translate.js',
    'public/lib/angular-translate-loader-partial/angular-translate-loader-partial.js',
    // Angular UI Router
    'public/lib/angular-ui-router/release/angular-ui-router.js',
    'public/lib/angular-ui-utils/modules/route/route.js',
    // Angular UI Router Extras
    'public/lib/ui-router-extras/release/ct-ui-router-extras.js',
    // Angular UI Bootstrap
    'public/js/lib/ui-bootstrap-0.14.3.js',
    'public/js/lib/ui-bootstrap-tpls-0.14.3.js',
    // Angular CC forms
    'public/lib/angular-credit-cards/release/angular-credit-cards.js',
    // Venturocket UI slider control
    'public/lib/venturocket-angular-slider/build/angular-slider.js',
    // regular ol' Bootsrap JS for tooltips
    'public/js/lib/bootstrap.js',
    // Lightbox
    'public/lib/angular-loading-bar/build/loading-bar.js',
    'public/lib/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox.js',
    'public/lib/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox.css',
    // elevation profile
    'public/js/lib/elevation-widget.js',
    // color picker
    'public/lib/ngjs-color-picker/js/ngjs-color-picker.js',
    'public/lib/ngjs-color-picker/css/ngjs-color-picker.css',
    // Angular Audio
    'public/lib/angular-audio/app/angular.audio.js',
    // FontLoader
    'public/js/lib/FontLoader.js',
    // nanoscroller
    'public/lib/nanoscroller/bin/javascripts/jquery.nanoscroller.js',
    'public/lib/angular-nanoscroller/scrollable.js',
    // pikaday
    'public/lib/pikaday/pikaday.js',
    'public/lib/pikaday-angular/pikaday-angular.js',
    // FileSaver
    'public/js/lib/FileSaver.js',
    // canvas.toBlob()
    'public/js/lib/canvas-toBlob.js',

    // Avanet App
    'public/js/app.js',
    'public/js/routes.js',
    // app scripts
    'public/modules/**/*.js',
    'public/js/services/*.js',
    'public/js/controllers/*.js',
    'public/js/controllers/*/*.js',
    'public/js/directives/*.js',
    'public/js/directives/*/*.js',
    'public/css/**/*.css',
    // init
    'public/js/init.js',
  ];

// ----------------------------------------------------------------------------------

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

// gulp.task('copyright', function() {
//   return gulp.src(['_dist/public/assets/*.js'])
//   .pipe(insert.prepend('// Copyright (C) 2015 Avatech, Inc.\n'))
//   .pipe(insert.append(';(function(){setInterval(function(){console.log("Copyright (C) 2015 Avatech, Inc.")},10000);})();'))
//   .pipe(gulp.dest(function(file) { return file.base; }));
// });

gulp.task('sentry', function() {
  var opt = {
    DOMAIN: '', // prefix domain in the `name` param when upload file. Leave blank to use path. Do not add trailing slash 
    API_URL: 'https://app.getsentry.com/api/0/projects/avatech/web-client/',
    API_KEY: 'c8d2219c66e54cb1bfe5142927bbc116',
    debug: false ,
    versionPrefix: '', // Append before the version number in package.json 
  }
  var sentryRelease = require('gulp-sentry-release')('./package.json', opt);

  return gulp.src(_sources, { base: 'public' })
  .pipe(sentryRelease.release());
});

var revHashes = {};
gulp.task('combine-minify', function() {
  return gulp.src(_sources, { base: 'public' })
    // start creating source map
    .pipe(sourcemaps.init())
    // combine files
    .pipe(gulpif("*.js", concat({ path: bundleName + '.js', cwd: '' })))
    .pipe(gulpif("*.css", concat({ path: bundleName + '.css', cwd: '' })))
    // rename the concatenated files for cache-busting
    .pipe(rev())

    // minify CSS
    .pipe(gulpif('*.css', minifyCSS({ keepSpecialComments: 0 })))

    // add angular [] annotations
    .pipe(gulpif("*.js", ngAnnotate({ gulpWarnings: false })))

    // strip debug statements
    //.pipe(gulpif("*.js", stripDebug()))

    // uglify JS
    .pipe(gulpif("*.js", uglify()))

    // write js source map
    .pipe(gulpif("*.js", sourcemaps.write(".", { includeContent: true })))

    // add all assets to dist folder
    .pipe(gulpif('*.css', gulp.dest('_dist/public/assets')))
    .pipe(gulpif('*.js', gulp.dest('_dist/public/assets')))
    .pipe(gulpif('*.map', gulp.dest('_dist/public/assets')))

    // store rev file hashes for use later
    .pipe(tap(function(file) {
      if (file.revHash) revHashes[file.revOrigPath] = file.revHash;    
  }))
});

gulp.task('clean-main', function() {
  return gulp.src('_dist/server/views/main.html')
    // replace variable
    .pipe(replace({
        patterns: [
          { match: 'env', replacement: 'production' },
          { match: 'release', replacement: releaseVersion }
        ]
    }))
    // replace js files with combined files (include rev hash)
    .pipe(htmlreplace({ 
      js:  '/assets/' + bundleName + '-' + revHashes[bundleName + '.js']  + '.js', 
      css: '/assets/' + bundleName + '-' + revHashes[bundleName + '.css'] + '.css' 
    }))
    // clean html
    .pipe(htmlmin({ 
      removeComments: true,
      collapseWhitespace: true,
      preserveLineBreaks: true
    }))
    .pipe(gulp.dest(function(file) { return file.base; }));
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
});

gulp.task('buildMain', function () {
  // don't read the file contents - we only need filenames
  var sources = gulp.src(_sources, { read: false });
  // inject into main.html
  return gulp.src('server/views/main.html')
  .pipe(inject(sources, { ignorePath: 'public/', addRootSlash: true }))
  .pipe(gulp.dest('server/views'));
});

gulp.task('clean', function() {
	return gulp.src('_dist', {read: false}).pipe(clean({ force: true }));
})

// copy files to dist folder
gulp.task('copy', function() {
   return gulp.src([
    'server/**/*',
    'package.json','server.js','newrelic.js',
    'public/**',
   	], { base: './' })
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
});

// git stuff

gulp.task('remove-git', function() {
  // remove existing git
	return gulp.src('_dist./git', {read: false}).pipe(clean({ force: true })); });

  var exec = require("child_process").exec;
  var spawn = require('child_process').spawn;

  gulp.task('git', ['remove-git'], function(done) {
  process.chdir('_dist');
	exec("git init", {cwd: process.cwd }, function(err, stdout, stderr) {
 		gutil.log("Git: repository initialized");
		exec("git add .", {cwd: process.cwd }, function(err, stdout, stderr) {
   		gutil.log("Git: files added");
			exec("git commit -m '-'", {cwd: process.cwd }, function(err, stdout, stderr) {
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
      var app = "avanet";
      
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

gulp.task('bump', function(){
  gulp.src('package.json')
  .pipe(bump({ type: 'patch' }))
  // keep track of new version
  .pipe(tap(function(file){
      var json = JSON.parse(String(file.contents));
      releaseVersion = json.version;
  }))
  .pipe(gulp.dest(function(file) { return file.base; }));
});

gulp.task('build', function(done) {
  runSequence('compass',
    // bump version
    'bump',
    // inject files into main
    'buildMain',
    // remove existing _dist folder
    'clean', 
    // copy files into _dist
    'copy',
    //'sentry',
    // combine and minify js and css
    'combine-minify',
    // clean main.html
    'clean-main',
    // // add copyright statements to app.js
    // 'copyright',
    // cleanup files
    'clean-dist', 
    // prepare git for pushing to heroku
    'git',
  done);
});

gulp.task('start', function(done) {
  runSequence('compass','buildMain','run', done);
});

gulp.task('run', function(done) {
  // todo:
  // - buildMain when js folder changes?
   nodemon({
    script: 'server.js'
  , ext: 'js html'
  //, watch: ['public','app','config', '!public/tiles']
  , env: { 'NODE_ENV': 'development' }
  });
});

gulp.task('start-dist', function(done) {
    process.chdir('_dist');
    nodemon({
      script: 'server.js'
    //, ext: '!*'
    , env: { 'NODE_ENV': 'production' }
    })
});

gulp.task('build-deploy', function(done) {
  runSequence('build','deploy', done);
});
