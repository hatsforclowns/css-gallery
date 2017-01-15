/*jslint node: true */
'use strict';


// Define dependencies
var gulp = require('gulp'),
    fs = require('fs'),
    compass = require('gulp-compass'),
    clean = require('gulp-clean-css'),
    replace = require('gulp-replace'),
    htmlmin = require('gulp-htmlmin'),
    server = require('browser-sync').create(),
    reload = server.reload;

// Define directories
var dirs = {
  dist: './dist',
  img:  './assets/img',
  css:  './assets/css',
  scss: './assets/scss'
}

// Define paths
var paths = {
  html: [ '!./dist/*.html', './*.html'],
  img:  [dirs.img + '/**/*'],
  css:  [dirs.css + '/**/*.css'],
  scss: [dirs.scss + '/**/*.scss']
};

// Compile Sass and minify CSS
gulp.task('compass', function(cb) {
  return gulp.src(paths.scss)
    .pipe(compass({
      config_file: './compass.rb',
      sass: dirs.scss,
      css: dirs.css
    }))
    // .pipe(clean({compatibility: 'ie8'}))
    .pipe(gulp.dest(dirs.css))
    .pipe(server.reload({stream: true}))
    cb()
});

// Create distribution HTML
gulp.task('dist', ['compass'], function() {
  return gulp.src(paths.html)
  .pipe(replace(/<link href="assets\/css\/app.css"[^>]*>/, function(s) {
      var style = fs.readFileSync(dirs.css + '/app.css', 'utf8');
      return '<style>\n' + style + '\n</style>';
  }))
  .pipe(replace('../img/', '../assets/img/'))
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest(dirs.dist))
});

// Create static server to preview page
gulp.task('server', ['compass'], function() {
  server.init({
    server: {
      baseDir: "./",
    },
    open: false,
    reloadOnRestart: true
  });
});

// Watch stream paths & re-run task if changes detected
gulp.task('watch', function () {
  gulp.watch(paths.html, ['dist', reload]);
  gulp.watch(paths.scss, ['compass', 'dist']);
  gulp.watch(paths.img, ['compass', 'dist', reload]);
});


// Run default task
gulp.task('default', ['compass', 'dist', 'server', 'watch']);
