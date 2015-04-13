var gulp = require('gulp');

var path = require('path');
var fs = require("fs");
var compass = require('gulp-compass');
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
var nodemon = require('gulp-nodemon');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var replace = require('gulp-replace-task');

var s3 = require("gulp-s3");
var aws = {
    key: 'AKIAIQFLR4EQC63ZZTNQ'
  , secret: 'VgUlNeUB02Q0pgsflT+p3/vDY9LdsXLOx/4IIONk'
  , bucket: 'avanet'
};

gulp.task('upload-s3', function() {
  return gulp.src('app/views/503-maint.html', { read: true})
    .pipe(s3(aws, { headers: { 'x-amz-acl': 'public-read' } }));
});
// https://devcenter.heroku.com/articles/error-pages#customize-pages
gulp.task('push-error-pages', ['upload-s3'], function(done){
    var error_url = "//s3.amazonaws.com/avanet/503-maint.html";
    var maint_url = "//s3.amazonaws.com/avanet/503-maint.html";

  exec("heroku config:set ERROR_PAGE_URL=" + error_url + " MAINTENANCE_PAGE_URL=" + maint_url + " --app avanet", {cwd: process.cwd }, function(err, stdout, stderr){

      console.log(stderr);
      console.log(stdout);
      done();
     });
});
 
gulp.task('compass', function() {
  return gulp.src('public/sass/**/*.scss')
    .pipe(compass({
      css: 'public/css',
      sass: 'public/sass',
      //image: 'app/assets/images'
    }))
    //.pipe(minifyCSS())
    .pipe(gulp.dest('public/css'));
});

gulp.task('combine-minify', function() {
    var assets = useref.assets({ searchPath: 'public' });

  return gulp.src('_dist2/app/views/main.html')
    .pipe(replace({
        patterns: [{ match: 'env', replacement: 'production' }]
    }))

    .pipe(assets)
    .pipe(gulpif('*.css', minifyCSS()))

    //.pipe(gulpif('*.js', sourcemaps.init()))

    .pipe(gulpif('*.js', ngAnnotate()))

    .pipe(gulpif('*.js', uglify()))

    .pipe(rev())                // Rename the concatenated files
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(revReplace())         // Substitute in new filenames

    //.pipe(gulpif('*.js', sourcemaps.write('./')))

    .pipe(gulpif('*.css', gulp.dest('_dist2/public')))
    .pipe(gulpif('*.js', gulp.dest('_dist2/public')))
    .pipe(gulpif('*.map', gulp.dest('_dist2/public')))

    .pipe(gulpif('*.html', gulp.dest('_dist2/app/views')))

    //.on('end', done);
    //.pipe(gulp.dest('_dist4/app/views'));
});

gulp.task('buildMain', function () {
  var target = gulp.src('app/views/main.html');

  var sources = gulp.src([
	'public/modules/**/*.js',
    'public/js/services/*.js',
    'public/js/controllers/*.js',
    'public/js/controllers/*/*.js',
    'public/js/directives/*.js',
    'public/js/directives/*/*.js'
  ],
  // don't read the file contents - we only need filenames
  {read: false});
 
  return target.pipe(inject(sources,{
        ignorePath: 'public/',
        addRootSlash: true,
    }))
    .pipe(gulp.dest('app/views'));
});

gulp.task('clean', function() {
	return gulp.src('_dist2', {read: false})
        .pipe(clean({ force: true }));
})
gulp.task('copy', function() {
   return gulp.src(
   	['app/**/*','config/**/*','package.json','server.js','Procfile','newrelic.js',
     
    'public/*.txt',
   	'public/fonts/**',
   	'public/img/**',
   	'public/js/**',
   	'public/modules/**/*.html',
   	'public/views/**'
   	]
   	, { base: './' })
   .pipe(gulp.dest('_dist2'));
});

gulp.task('lint',function(){
 return gulp.src('public/js/**/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'))
  .pipe(jshint.reporter('fail'));
})

// git stuff

gulp.task('remove-git', function() {
	return gulp.src('_dist2./git', {read: false})
        .pipe(clean({ force: true }));
})

var exec = require("child_process").exec;
var spawn = require('child_process').spawn;

gulp.task('git', ['remove-git'], function(done){
		
    process.chdir('_dist2');

	exec("git init", {cwd: process.cwd }, function(err, stdout, stderr){
   		console.log("Git: repository initialized");

		exec("git add .", {cwd: process.cwd }, function(err, stdout, stderr){
       		//console.log(stdout);
       		console.log("Git: files added");

			exec("git commit -m '-'", {cwd: process.cwd }, function(err, stdout, stderr) {
	       		//console.log(stdout);
	       		console.log("Git: files committed");

    			process.chdir('../');

	       		done();
			});
		});
     });
});


gulp.task('deploy', function(done){
	fs.exists("_dist2",function(exists){

		if (!exists) {
			console.error("dist folder does not exist. run 'gulp build' first.");
    		done();
    		return;
		}
		
	    process.chdir('_dist2');

	    var remoteName = "heroku";
	    var remoteUrl = "git@heroku.com:avanet.git";

	    exec("git remote rm " + remoteName, {cwd: process.cwd }, function(err, stdout, stderr){
			exec("git remote add " + remoteName + " " + remoteUrl, {cwd: process.cwd }, function(err, stdout, stderr){
	       		//console.log(stdout);
	   			console.log("git remote added");

					exec("heroku config:set NODE_ENV=production -app avanet", {cwd: process.cwd }, function(err, stdout, stderr){

		       		console.log(stdout);
		       		console.log("Pushing...")

					var heroku = spawn("git",["push" ,remoteName, "master", "-f"], { cwd: process.cwd })

					heroku.stdout.on('data', function (data) { console.log("" + data); });
					heroku.stderr.on('data', function (data) { console.log("" + data); });

					heroku.on('exit', function (code) { done(); });
				});
			});
		});
	});
});

// gulp.task('files', function(done){
// 	exec("ls -l", {cwd: process.cwd }, function(err, stdout, stderr){
//    		console.log(stdout);
//    		done();
// 	});
// });

// gulp.task('heroku-login', function () {
//   //process.chdir('_dist2');
//   return gulp.src('', {read: false})
//     .pipe(shell(["ls -l"]
//     // , {
//     //   templateData: {
//     //     f: function (s) {
//     //       return s.replace(/$/, '.bak')
//     //     }
//     //   }
//     //}
//     ))
// })

// heroku utils
gulp.task('logs', function(done){
    process.chdir('_dist2');
	exec("heroku logs -app avanet", {cwd: process.cwd }, function(err, stdout, stderr){

   		console.log(stdout);
   		done();
     });
});


gulp.task('build', function(done) {
  runSequence('compass','buildMain','clean', 'copy','combine-minify', 'git',
              done);
});

gulp.task('start', function(done) {
  gulp.watch('public/sass/**/*', ['compass']);

  // todo:
  // - livereload when public changes 'public/**/*'

   nodemon({
    script: 'server.js'
  , ext: 'js html'
  , env: { 'NODE_ENV': 'development' }
  })
});

gulp.task('start-dist', function(done) {
    process.chdir('_dist2');
  gulp.watch('public/sass/**/*', ['compass']);

   nodemon({
    script: 'server.js'
  , ext: 'js html'
  , env: { 'NODE_ENV': 'development' }
  })
});

gulp.task('build-deploy', function(done) {
  runSequence('build','deploy', done);
});
