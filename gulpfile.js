// packages:
//==========
var _gulp           = require('gulp');
var _path           = require('path');
var _gutil          = require('gulp-util');
var _clean          = require('gulp-clean');
var _concat         = require('gulp-concat');
var _rename         = require('gulp-rename');
var _jshint         = require('gulp-jshint');
var _uglify         = require('gulp-uglify');
var _less           = require('gulp-less');
var _cssnano        = require('gulp-cssnano');
var _es             = require('event-stream');
var _embedlr        = require('gulp-embedlr');
var _refresh        = require('gulp-livereload');
var _express        = require('express');
var _http           = require('http');
var _lr             = require('tiny-lr')();
var _sourcemaps     = require('gulp-sourcemaps');
var _autoprefixer   = require('gulp-autoprefixer');

// tasks:
//=======

// Clear the destination folder
_gulp.task('clean', function () {
    _gulp.src('./dist/**/*.*', { read: false })
        .pipe(_clean({ force: true }));
});


// Copy all application files except *.less and .js into the `dist` folder
_gulp.task('copy', function () {
    return _es.concat(
        _gulp.src([ './src/fonts/**' ])
            .pipe(_gulp.dest('./dist/fonts')),

        _gulp.src([ './src/images/**' ])
            .pipe(_gulp.dest('./dist/images')),

        // _gulp.src([ './node_modules/normalize.css/**' ])
        //     .pipe(_gulp.dest('./dist/vendor/normalize')),
        _gulp.src([ './node_modules/jquery/**' ])
            .pipe(_gulp.dest('./dist/vendor/jquery')),
        _gulp.src([ './node_modules/bootstrap-switch/**' ])
            .pipe(_gulp.dest('./dist/vendor/bootstrap-switch')),
        _gulp.src([ './node_modules/bootstrap/**' ])
            .pipe(_gulp.dest('./dist/vendor/bootstrap'))
    );
});

// Compile Templates files
_gulp.task('templates', function () {
    return _gulp.src('./src/*.html')
        .pipe(_gulp.dest('./dist'))
        .pipe(_refresh(_lr));
});


// Compile LESS files
_gulp.task('styles', function () {
    return _gulp.src('./src/styles/app.less')
        .pipe(_sourcemaps.init())
            .pipe(_less({
                compress: true,
                paths: [
                    _path.join(__dirname, 'src', 'styles', 'includes'),
                ]
            }))
            .pipe(_rename('app.min.css'))
            .pipe(_autoprefixer({
                browsers: [ 'last 2 versions' ],
                cascade: false,
                remove: true
            }))
        .pipe(_sourcemaps.write('.'))
        .pipe(_gulp.dest('./dist/styles'))
        .pipe(_refresh(_lr));
});


_gulp.task('scripts', function () {
    return _es.concat(
        // Detect errors and potential problems in your JavaScript code
        // You can enable or disable default JSHint options in the .jshintrc file
        _gulp.src([ './src/scripts/**/*.js' ])
            .pipe(_jshint('.jshintrc'))
            .pipe(_jshint.reporter(require('jshint-stylish'))),

        // Concatenate, minify and copy all JavaScript (except vendor scripts)
        _gulp.src([ './src/scripts/**/*.js' ])
            .pipe(_concat('app.min.js'))
            .pipe(_uglify())
            .pipe(_gulp.dest('./dist/scripts'))
            .pipe(_refresh(_lr))
    );
});


// Create a HTTP server for static files
_gulp.task('server', function () {
    var port = 3000;
    var app = _express();
    var server = _http.createServer(app);

    app.use(_express.static(__dirname + '/dist'));

    server.on('listening', function () {
        _gutil.log('Listening on http://locahost:' + server.address().port);
    });

    server.on('error', function (err) {
        if (err.code === 'EADDRINUSE') {
            _gutil.log('Address in use, retrying...');
            setTimeout(function () {
                server.listen(port);
            }, 1000);
        }
    });

    server.listen(port);
});

// Create a LiveReload server
_gulp.task('lr-server', function () {
    _lr.listen(35729, function (err) {
        if (err) {
            _gutil.log(err);
        }
    });
});

_gulp.task('watch', function () {
    // Watch .js files and run tasks if they change
    _gulp.watch('./src/scripts/**/*.js', [ 'scripts' ]);

    // Watch .less files and run tasks if they change
    _gulp.watch('./src/styles/**/*.less', [ 'styles' ]);

    // Watch .html files and run tasks if they change
    _gulp.watch('./src/*.html', [ 'templates' ]);
});

// The dist task (used to store all files that will go to the server)
_gulp.task('dist', [
    'clean',
    'copy',
    'templates',
    'scripts',
    'styles'
]);

// The default task (called when you run `gulp`)
_gulp.task('default', [
    'copy',
    'templates',
    'scripts',
    'styles',
    'lr-server',
    'server',
    'watch'
]);
