// 实现这个项目的构建任务
const { src, dest, series, parallel, watch } = require('gulp');
const browserSync = require('browser-sync');
const bs = browserSync.create();
const del = require('del');
const loadPlugins = require('gulp-load-plugins');
const plugins = loadPlugins();

const data = {
  menus: [
    {
      name: 'Home',
      icon: 'aperture',
      link: 'index.html'
    },
    {
      name: 'Features',
      link: 'features.html'
    },
    {
      name: 'About',
      link: 'about.html'
    },
    {
      name: 'Contact',
      link: '#',
      children: [
        {
          name: 'Twitter',
          link: 'https://twitter.com/w_zce'
        },
        {
          name: 'About',
          link: 'https://weibo.com/zceme'
        },
        {
          name: 'divider'
        },
        {
          name: 'About',
          link: 'https://github.com/zce'
        }
      ]
    }
  ],
  pkg: require('./package.json'),
  date: new Date()
}

const styles = () => {
  console.log("执行 styles 任务");
  return src('src/assets/styles/*.scss', { base: 'src' })
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(dest('temp'));
}

const scripts = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
    .pipe(plugins.babel({
      presets: ['@babel/env']
    }))
    .pipe(dest('temp'))
};

const pages = () => {
  return src('src/*.html', { base: 'src' })
    .pipe(plugins.swig({ data }))
    // .pipe(plugins.htmlmin({ collapseWhitespace: true }))
    .pipe(dest('temp'));
};

const images = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
};

const fonts = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
};

const extra = () => {
  return src('public/**')
    .pipe(dest('dist'));
};

const clean = () => {
  return del(['dist']);
}
const server = () => {
  watch('./src/assets/styles/*.scss', styles);
  watch('./src/assets/scripts/*.js', scripts);
  watch('./src/*.html', pages);
  watch(['./src/assets/images/**', './src/assets/fonts/**', './public/**'], bs.reload);

  bs.init({
    notify: false,
    files: ['temp', 'src', 'public'],
    server: {
        baseDir: "temp",
        routes: {
          '/node_modules': 'node_modules'
        }
    }
  });
}

const useref = () => {
  return src('temp/*.html')
    .pipe(plugins.useref({ searchPath:['temp', '.'] }))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(dest('dist'));
}

const compile = parallel(styles, scripts, pages, images, fonts, extra);
const build = series(clean, compile, useref);
const serve = series(parallel(styles, scripts, pages, images, fonts, extra), server);

module.exports = {
  clean,
  serve,
  build
}