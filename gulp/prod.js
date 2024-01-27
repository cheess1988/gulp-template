const gulp = require('gulp'); // подключение gulp
const fileInclude = require('gulp-file-include'); // вставка html-шаблонов
const htmlclean = require('gulp-htmlclean'); // минификация html
const webpHTML = require('gulp-webp-html'); // добавляем webp в html
const sass = require('gulp-sass')(require('sass')); // подключение sass
const sassGlob = require('gulp-sass-glob'); // автоподключение sass файлов
const csscomb = require('gulp-csscomb'); // форматирование css
const autoprefixer = require('gulp-autoprefixer'); // подключение autoprefixer
const csso = require('gulp-csso'); // минификация css
const webpCSS = require('gulp-webp-css'); // добавляем webp в css
const browsersync = require('browser-sync').create(); // автоматическая перезагрузка браузера
const clean = require('gulp-clean'); // удаление файлов/папок
const fileSystem = require('fs'); // поддержка системных файлов/папок
const sourceMaps = require('gulp-sourcemaps'); // правильные пути к файлам в браузере
const groupMedia = require('gulp-group-css-media-queries'); // группировка медиа-запросов
const plumber = require('gulp-plumber'); // предотвращает зависание сборки
const notify = require('gulp-notify'); // уведомления об ошибках
const webpack = require('webpack-stream'); // подключение webpack
const babel = require('gulp-babel'); // подключение babel
const changed = require('gulp-changed'); // обрабатываем только измененные файлы
const imagemin = require('gulp-imagemin'); // сжатие и оптимизация изображений
const webp = require('gulp-webp'); // конвертация изображений в WebP

// Очищаем папку dist
gulp.task('clean:prod', function (done) {
    if (fileSystem.existsSync('./prod/')) {
        return gulp
            .src('./prod/', { read: false })
            .pipe(clean({ force: true }))
    }
    done();
})

const plumberNotify = (title) => {
    return {
        errorHandler: notify.onError({
            title: title,
            message: 'Error <%= error.message %>',
            sound: false
        })
    };
}

const fileIncludeConfig = {
    prefix: '@@',
    basepath: '@file'
}

// Собираем HTML
gulp.task('html:prod', function () {
    return gulp
        .src(['./src/html/**/*.html', '!./src/html/components/*.html'])
        .pipe(changed('./prod/'))
        .pipe(plumber(plumberNotify('HTML')))
        .pipe(fileInclude(fileIncludeConfig))
        .pipe(webpHTML())
        .pipe(htmlclean())
        .pipe(gulp.dest('./prod/'))
        .pipe(browsersync.stream())
});

// Собираем CSS
gulp.task('scss:prod', function () {
    return gulp
        .src('./src/scss/*.scss')
        .pipe(changed('./prod/css/'))
        .pipe(plumber(plumberNotify('SCSS')))
        .pipe(sourceMaps.init())
        .pipe(autoprefixer())
        .pipe(sassGlob())
        .pipe(csscomb())
        .pipe(webpCSS())
        .pipe(groupMedia())
        .pipe(sass())
        .pipe(csso())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./prod/css/'))
        .pipe(browsersync.stream())
});

// Собираем JS
gulp.task('js:prod', function () {
    return gulp
        .src('./src/js/*.js')
        .pipe(changed('./prod/js/'))
        .pipe(plumber(plumberNotify('JS')))
        .pipe(babel())
        .pipe(webpack(require('../webpack.config.js')))
        .pipe(gulp.dest('./prod/js/'))
        .pipe(browsersync.stream())
});

// Копируем изображения
gulp.task('images:prod', function () {
    return gulp
        .src('./src/img/**/*')
        .pipe(changed('./prod/img/'))
        .pipe(webp())
        .pipe(gulp.dest('./prod/img/'))
        .pipe(gulp.src('./src/img/**/*'))
        .pipe(changed('./prod/img/'))
        .pipe(imagemin({ verbose: true }))
        .pipe(gulp.dest('./prod/img/'))
        .pipe(browsersync.stream())
});

// Копируем шрифты
gulp.task('fonts:prod', function () {
    return gulp
        .src('./src/fonts/**/*')
        .pipe(changed('./prod/fonts/'))
        .pipe(gulp.dest('./prod/fonts/'))
        .pipe(browsersync.stream())
});

// Копируем файлы
gulp.task('files:prod', function () {
    return gulp
        .src('./src/files/**/*')
        .pipe(changed('./prod/files/'))
        .pipe(gulp.dest('./prod/files/'))
        .pipe(browsersync.stream())
});

// Запускаем live-сервер
gulp.task('server:prod', function () {
    browsersync.init({
        server: {
            baseDir: "./prod/"
        }
    });
});

// Следим за изменениями файлов
// gulp.task('watch:prod', function () {
//     gulp.watch('./src/**/*.html', gulp.parallel('html:prod'));
//     gulp.watch('./src/scss/**/*.scss', gulp.parallel('scss:prod'));
//     gulp.watch('./src/js/**/*.js', gulp.parallel('js:prod'));
//     gulp.watch('./src/img/**/*', gulp.parallel('images:prod'));
//     gulp.watch('./src/fonts/**/*', gulp.parallel('fonts:prod'));
//     gulp.watch('./src/files/**/*', gulp.parallel('files:prod'));
// });