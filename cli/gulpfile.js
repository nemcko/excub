const gulp = require('gulp');
const del = require('del');
const typescript = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const livereload = require('gulp-livereload');
const gulprename = require("gulp-rename");
const gulpexec = require('gulp-exec');
const tslint = require('gulp-tslint');
const utf8Convert = require('gulp-utf8-convert');

const tscConfig = require('./tsconfig.json');

var sources = {
    html: ["index.html","favicon.ico","cfg.json","./app/**/*.html"],
    css: "./app/**/*.css",
    ts: "./app/**/*.ts",
    assets: "assets/**/*",
    fonts: "fonts/**/*",
    csshtm: ["index.html","favicon.ico","./app/**/*.{css,html,woff2}"],
};
var destinations = {
    libs: "./dist/lib",
    dist: "./dist/"
};


gulp.task('csshtm', function () {
    gulp.src(sources.csshtm, { base: './' })
    .pipe(gulp.dest(destinations.dist));
});

gulp.task('mdl-component', function () {
    gulp.src("node_modules/angular2-mdl/components/index.js")
    .pipe(gulprename("angular2-mdl-component.js"))
    .pipe(gulp.dest(destinations.libs));
});


gulp.task('mdl-popover', function () {
    gulp.src("node_modules/@angular2-mdl-ext/popover/index.umd.js")
    .pipe(gulprename("angular2-mdl-popover.js"))
    .pipe(gulp.dest(destinations.libs));
});

gulp.task('mdl-select', function () {
    gulp.src("node_modules/@angular2-mdl-ext/select/index.umd.js")
  .pipe(gulprename("angular2-mdl-select.js"))
  .pipe(gulp.dest(destinations.libs));
});

gulp.task('rxjs', function () {
    gulp.src("node_modules/rxjs/**/*")
  .pipe(gulp.dest(destinations.libs + '/rxjs'));
});

gulp.task('Intl', function () {
    gulp.src([
        "node_modules/intl/dist/Intl.min.js",
        "node_modules/intl/dist/Intl.min.js.map",
        "node_modules/intl/locale-data/jsonp/en.js",
    ]).pipe(gulp.dest(destinations.libs + '/intl'));
});

//gulp.task('mdldialog', function () {
//    gulp.src("node_modules/angular2-mdl/components/dialog/**/*")
//  .pipe(gulp.dest(destinations.libs + '/mdldialog'));
//});


gulp.task('assets', function () {
    gulp.src(sources.assets)
  .pipe(gulp.dest(destinations.dist + '/assets'));
});

gulp.task('fonts', function () {
    gulp.src(sources.fonts)
  .pipe(gulp.dest(destinations.dist + '/fonts'));
});

gulp.task('copy', ['csshtm','mdl-component','mdl-popover','mdl-select', 'rxjs','assets','fonts','Intl'], function () {
    gulp.src([
        "node_modules/core-js/client/shim.min.js",
        "node_modules/core-js/client/shim.min.js.map",
        "node_modules/zone.js/dist/zone.js",
        "node_modules/zone.js/dist/zone.js.map",
        "node_modules/reflect-metadata/Reflect.js",
        "node_modules/reflect-metadata/Reflect.js.map",
        "node_modules/systemjs/dist/system.src.js",
        "node_modules/systemjs/dist/system.src.js.map",
        "systemjs.config.js",
        "node_modules/@angular/core/bundles/core.umd.js",
        "node_modules/@angular/common/bundles/common.umd.js",
        "node_modules/@angular/compiler/bundles/compiler.umd.js",
        "node_modules/@angular/platform-browser/bundles/platform-browser.umd.js",
        "node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js",
        "node_modules/@angular/http/bundles/http.umd.js",
        "node_modules/@angular/router/bundles/router.umd.js",
        "node_modules/@angular/forms/bundles/forms.umd.js",
        //"node_modules/rxjs/bundles/Rx.js",
        "node_modules/angular-in-memory-web-api/bundles/in-memory-web-api.umd.js",
        "node_modules/angular2-mdl/bundle/angular2-mdl.js",
    ]).pipe(gulp.dest(destinations.libs))
});


gulp.task('compile',['copy'], function () {
    return gulp
    .src(sources.ts, { base: './' })
    .pipe(sourcemaps.init())
    .pipe(typescript(tscConfig.compilerOptions))
   .pipe(sourcemaps.write('.'))
   .pipe(gulp.dest(destinations.dist));
});


gulp.task('reloadHtml', function () {
    gulp.src(sources.html)
    .pipe(utf8Convert())
    .pipe(gulp.dest(destinations.html))
    .pipe(livereload());
});

gulp.task('reloadCss', function () {
    gulp.src(sources.css)
    .pipe(gulp.dest(destinations.css))
    .pipe(livereload());
});

gulp.task('reloadTs', function () {
    gulp.src(sources.ts)
    .pipe(sourcemaps.init())
    .pipe(typescript(tscConfig.compilerOptions))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(destinations.ts));
});

gulp.task("watch",['copy'], function () {
    livereload.listen();    
    gulp.watch(sources.html).on('change', function (event) {
        gulp.src([event.path], { base: './' })
        .pipe(gulp.dest(destinations.dist))
        .pipe(livereload());
    });
    gulp.watch(sources.css).on('change', function (event) {
        gulp.src([event.path], { base: './' })
        .pipe(gulp.dest(destinations.dist))
        .pipe(livereload());
    });
    gulp.watch(sources.ts).on('change', function (event) {
        console.log('Transpile',event.path+'...');
        gulp.src([event.path], { base: './' })
        .pipe(sourcemaps.init())
        .pipe(typescript(tscConfig.compilerOptions))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(destinations.dist))
        .pipe(livereload());
    });
});
//gulp.task('build', [ 'compile', 'css', 'html','copy:libs', 'copy:assets']);
//gulp.task('build', [ 'css', 'html']);


//gulp.task('default', ['copy', 'watch']);
gulp.task('default', ['copy','compile', 'watch']);