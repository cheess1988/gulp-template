const gulp = require('gulp'); // подключение gulp
const fileInclude = require('gulp-file-include'); // вставка html-шаблонов
const sass = require('gulp-sass')(require('sass')); // подключение sass
const sassGlob = require('gulp-sass-glob'); // автоподключение sass файлов
const csscomb = require('gulp-csscomb'); // форматирование css
const browsersync = require('browser-sync').create(); // автоматическая перезагрузка браузера
const clean = require('gulp-clean'); // удаление файлов/папок
const fileSystem = require('fs'); // поддержка системных файлов/папок
const sourceMaps = require('gulp-sourcemaps'); // правильные пути к файлам в браузере
const plumber = require('gulp-plumber'); // предотвращает зависание сборки
const notify = require('gulp-notify'); // уведомления об ошибках
const webpack = require('webpack-stream'); // подключение webpack
const babel = require('gulp-babel'); // подключение babel
const changed = require('gulp-changed'); // обрабатываем только измененные файлы
const imagemin = require('gulp-imagemin'); // сжатие и оптимизация изображений
const webp = require('gulp-webp'); // конвертация изображений в WebP

// Очищаем папку dist
gulp.task('clean:dev', function (done) {
    if (fileSystem.existsSync('./dev/')) {
        return gulp
            .src('./dev/', { read: false })
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
gulp.task('html:dev', function () {
    return gulp
        .src(['./src/html/**/*.html', '!./src/html/components/*.html'])
        .pipe(changed('./dev/', { HashChanged: changed.compareContents }))
        .pipe(plumber(plumberNotify('HTML')))
        .pipe(fileInclude(fileIncludeConfig))
        .pipe(gulp.dest('./dev/'))
        .pipe(browsersync.stream())
});

// Собираем CSS
gulp.task('scss:dev', function () {
    return gulp
        .src('./src/scss/*.scss')
        .pipe(changed('./dev/css/'))
        .pipe(plumber(plumberNotify('SCSS')))
        .pipe(sourceMaps.init())
        .pipe(sassGlob())
        .pipe(csscomb())
        .pipe(sass())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./dev/css/'))
        .pipe(browsersync.stream())
});

// Собираем JS
gulp.task('js:dev', function () {
    return gulp
        .src('./src/js/*.js')
        .pipe(changed('./dev/js/'))
        .pipe(plumber(plumberNotify('JS')))
        .pipe(babel())
        .pipe(webpack(require('./../webpack.config.js')))
        .pipe(gulp.dest('./dev/js/'))
        .pipe(browsersync.stream())
});

// Копируем изображения
gulp.task('images:dev', function () {
    return gulp
        .src('./src/img/**/*')
        .pipe(changed('./dev/img/'))
        .pipe(webp())
        .pipe(gulp.dest('./dev/img/'))
        .pipe(gulp.src('./src/img/**/*'))
        .pipe(imagemin({ verbose: true }))
        .pipe(gulp.dest('./dev/img/'))
        .pipe(browsersync.stream())
});

// Копируем шрифты
gulp.task('fonts:dev', function () {
    return gulp
        .src('./src/fonts/**/*')
        .pipe(changed('./dev/fonts/'))
        .pipe(gulp.dest('./dev/fonts/'))
        .pipe(browsersync.stream())
});

// Копируем файлы
gulp.task('files:dev', function () {
    return gulp
        .src('./src/files/**/*')
        .pipe(changed('./dev/files/'))
        .pipe(gulp.dest('./dev/files/'))
        .pipe(browsersync.stream())
});

// Запускаем live-сервер
gulp.task('server:dev', function () {
    browsersync.init({
        server: {
            baseDir: "./dev/"
        }
    });
});

// Следим за изменениями файлов
gulp.task('watch:dev', function () {
    gulp.watch('./src/**/*.html', gulp.parallel('html:dev'));
    gulp.watch('./src/scss/**/*.scss', gulp.parallel('scss:dev'));
    gulp.watch('./src/js/**/*.js', gulp.parallel('js:dev'));
    gulp.watch('./src/img/**/*', gulp.parallel('images:dev'));
    gulp.watch('./src/fonts/**/*', gulp.parallel('fonts:dev'));
    gulp.watch('./src/files/**/*', gulp.parallel('files:dev'));
});