# Dependencies.
gulp = require('gulp')

# Testing.
jasmine = require('gulp-jasmine')
gulp.task('test', ['compile'], () ->
    gulp.src('spec/**/*.coffee')
        .pipe(jasmine())
)

# Linting.
coffeelint = require('gulp-coffeelint')
gulp.task('lint', () ->
    gulp.src(['**/*.coffee', '!node_modules/**/*.coffee'])
        .pipe(coffeelint('coffeelint.json'))
        .pipe(coffeelint.reporter())
)

# Compiling.
coffee = require('gulp-coffee')
sourcemaps = require('gulp-sourcemaps')
gulp.task('compile', () ->
    gulp.src('src/**/*.coffee')
        .pipe(sourcemaps.init())
        .pipe(coffee())
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest('build'))
)

gulp.task('default', ['lint', 'test', 'compile'])
