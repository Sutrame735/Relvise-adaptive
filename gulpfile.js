const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const rename = require('gulp-rename')
const cleanCSS = require('gulp-clean-css')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps')
const imagemin = require('gulp-imagemin')
const autoprefixer = require('gulp-autoprefixer')
const del = require('del')
const htmlmin = require('gulp-htmlmin')
const size = require('gulp-size')
const newer = require('gulp-newer')
const browserSync = require('browser-sync').create()
const ttf2woff2 = require('gulp-ttf2woff2')
const ttf2woff = require('gulp-ttf2woff')


const paths = {
    html: {
        src: 'src/*.html', dest: 'dist',
    }, styles: {
        src: ['src/scss/**/*.scss', 'src/scss/**/*.sass'], dest: 'dist/scss/',
    }, scripts: {
        src: 'src/js/**/*.js', dest: 'dist/js/',
    }, images: {
        src: 'src/img/**', dest: 'dist/img/',
    }, fonts: {
        src: 'src/fonts/**.ttf', dest: 'dist/fonts/',
    }
}

function fonts(done) {
    gulp.src(paths.fonts.src)
        .pipe(ttf2woff())
        .pipe(gulp.dest(paths.fonts.dest))
    gulp.src(paths.fonts.src)
        .pipe(ttf2woff2())
        .pipe(gulp.dest(paths.fonts.dest))
    done()
}

function scripts() {
    return gulp.src(paths.scripts.src)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(concat('app.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(size({
            showFiles: true
        }))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.stream());
}

function img() {
    return gulp.src(paths.images.src)
        .pipe(newer(paths.images.dest))
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(size())
        .pipe(gulp.dest(paths.images.dest))
}

function clean() {
    return del(['dist/*', '!dist/img'])
}


function html() {
    return gulp.src(paths.html.src)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(size())
        .pipe(gulp.dest(paths.html.dest))
        .pipe(browserSync.stream());
}

function styles() {
    return gulp.src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(rename({
            basename: 'style', suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(size())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream());
}

function watch() {
    browserSync.init({
        server: "./dist/"
    });
    gulp.watch(paths.html.dest).on('change', browserSync.reload)
    gulp.watch(paths.html.src, html)
    gulp.watch(paths.styles.src, styles)
    gulp.watch(paths.scripts.src, scripts)
    gulp.watch(paths.images.src, img)
    gulp.watch(paths.fonts.src, fonts)
}

const build = gulp.series(clean, html, gulp.parallel(styles, scripts, img, fonts), watch)
exports.fonts = fonts
exports.clean = clean
exports.img = img
exports.html = html
exports.styles = styles
exports.scripts = scripts
exports.watch = watch
exports.build = build
exports.default = build