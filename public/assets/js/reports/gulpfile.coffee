# Dependencies.
gulp = require('gulp')
rename = require('gulp-rename')

watches = []

changeExt = (path) ->
  path.basename = String(path.basename.split('.')[0])
  null

compile = (src, dest, compiler) ->
  split = src.split('.')
  split.splice(-2, 1)
  watch = split.join('.')
  watches.push(watch)

  gulp.task(watch, () ->
    gulp.src("#{src}")
      .pipe(compiler())
      .pipe(rename(changeExt))
      .pipe(gulp.dest(dest))
  )

compile('./reports/**/*.html.jade', './reports', () -> require('gulp-jade')({
  pretty: true
}))

# Watch.
gulp.task('watch', () ->
    watches.forEach((watch) -> gulp.watch(watch, [watch]))
)

# The default task (called when you run `gulp` from cli).
gulp.task('default', watches.map((watch) -> watch))