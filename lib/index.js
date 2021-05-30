// 实现这个项目的构建任务
const { src, dest, series, parallel, watch } = require('gulp');
const browserSync = require('browser-sync');
const bs = browserSync.create();
const del = require('del');
const loadPlugins = require('gulp-load-plugins');
const plugins = loadPlugins();
const cwd = process.cwd();
const path = require('path')

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
  pkg: require(path.resolve(`${cwd}/package.json`)),
  date: new Date()
}

const buildInfo = require(path.resolve(`${cwd}/gulppage.config`)).build;

const buildConfig = Object.assign({}, {
  src: 'src',
  dist: 'dist',
  temp: 'temp',
  public: 'public',
  path: {
    styles: 'assets/styles/*.scss',
    scripts: 'assets/scripts/*.js',
    pages: '*.html',
    images: 'assets/images/**',
    fonts: 'assets/fonts/**',
    public: '**'
  }
}, buildInfo)

console.log(buildConfig);

const styles = () => {
  return src(buildConfig.path.styles, { base: 'src', cwd: buildConfig.src })
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(dest(buildConfig.temp));
}

const scripts = () => {
  return src(buildConfig.path.scripts, { base: 'src', cwd: buildConfig.src })
    .pipe(plugins.babel({
      presets: [require('@babel/preset-env')]
    }))
    .pipe(dest(buildConfig.temp));
};

const pages = () => {
  return src(buildConfig.path.pages, { base: 'src', cwd: buildConfig.src })
    .pipe(plugins.swig({ data }))
    // .pipe(plugins.htmlmin({ collapseWhitespace: true }))
    .pipe(dest(buildConfig.temp));
};

const images = () => {
  console.log("压缩图片");
  console.log(buildConfig.path.images);
  console.log(buildConfig.src);
  return src(buildConfig.path.images, { base: 'src', cwd: buildConfig.src })
    .pipe(plugins.imagemin())
    .pipe(dest(buildConfig.dist))
};

const fonts = () => {
  console.log("压缩字体");
  return src(buildConfig.path.fonts, { base: 'src', cwd: buildConfig.src })
    .pipe(plugins.imagemin())
    .pipe(dest(buildConfig.dist))
};

const extra = () => {
  return src(buildConfig.path.public, { cwd: buildConfig.public })
    .pipe(dest(buildConfig.dist));
};

const clean = () => {
  return del([buildConfig.dist]);
}
const server = () => {
  watch('./src/assets/styles/*.scss', styles);
  watch('./src/assets/scripts/*.js', scripts);
  watch('./src/*.html', pages);
  watch(['./src/assets/images/**', './src/assets/fonts/**', './public/**'], bs.reload);

  bs.init({
    notify: false,
    files: [buildConfig.temp, buildConfig.src, buildConfig.public],
    server: {
        baseDir: buildConfig.temp,
        routes: {
          '/node_modules': 'node_modules'
        }
    }
  });
}

const useref = () => {
  return src(buildConfig.path.pages, { cwd: buildConfig.temp })
    .pipe(plugins.useref({ searchPath:[buildConfig.temp, '.'] }))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(dest(buildConfig.dist));
}

const compile = parallel(styles, scripts, pages, images, fonts, extra);
const build = series(compile, useref);
const serve = series(parallel(styles, scripts, pages, images, fonts, extra), server);

module.exports = {
  clean,
  serve,
  build,
  images,
  fonts
}