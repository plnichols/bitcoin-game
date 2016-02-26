'use strict';

// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var notify = require("gulp-notify");
var concat = require("gulp-concat");


// Lint Task
gulp.task('lint', function() {
    return gulp.src(['app/**/*.js', '!app/bower_components/**/*', '!**/js/main*'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(notify({onLast:true, message:'JShint done!'}));
});

// Compile Sass
gulp.task('sass', function() {
    gulp.src('app/scss/**/*.scss')
        .pipe(sass())
        .pipe(rename('main.css'))
        .pipe(autoprefixer({ browsers: ['last 2 versions', '> 5%', 'Firefox ESR'] }))
        .pipe(gulp.dest('app/css'))
        .pipe(notify({onLast:true, message:'Sass done!'}));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src(['app/**/*.js', '!app/bower_components/**/*', '!**/js/main*', '!**/js/app*'])
        .pipe(concat('main.js'))
        .pipe(gulp.dest('app/js'))
        .pipe(notify({onLast:true, message:'Scripts done!'}));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch(['app/**/*.js', '!app/bower_components/**/*', '!**/js/main*'], ['lint', 'scripts']);
    gulp.watch('app/scss/**/*.scss', ['sass']);
});


// Default Task
gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);
