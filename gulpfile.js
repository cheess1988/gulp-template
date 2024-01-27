const gulp = require('gulp'); // подключение gulp

// Tasks
require('./gulp/dev.js');
require('./gulp/prod.js');

// Запускаем задачи для dev-сборки
gulp.task('default', gulp.series(
    'clean:dev',
    gulp.parallel('html:dev', 'scss:dev', 'js:dev', 'images:dev', 'fonts:dev', 'files:dev'),
    gulp.parallel('server:dev', 'watch:dev')
));

// Запускаем задачи для prod-сборки
gulp.task('prod', gulp.series(
    'clean:prod',
    gulp.parallel('html:prod', 'scss:prod', 'js:prod', 'images:prod', 'fonts:prod', 'files:prod'),
    gulp.parallel('server:prod')
));