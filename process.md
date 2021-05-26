# 使用 gulp 完成项目构建

## 实现功能

- [x] html 模版、sass/ES6+ 编译、images/fonts 压缩
- [x] 资源压缩
- [x] dev-server
- [x] 指令合并
- [ ] 发布到 npm，可通过指令构建

## 使用工具

- html:
  - gulp-htmlmin：文件压缩
    - collapseWhitespace: true
    - minifyCSS: true
    - minifyJS: true
  - gulp-swig：模版引擎
    - gulpSwig({data})
- sass:
  - gulp-clean-css：压缩 css
  - gulp-sass：编译 sass 文件
    - { outputStyle: 'expanded' }
- js:
  - gulp-uglify
  - @babel/core、@babel/preset-env、gulp-babel：ES6+ 转 ES5 相关
- assets(image/font):
  - gulp-imagemin：压缩资源
- 构建相关：
  - gulp-load-plugins：加载 glup 插件使用
  - del：删除 dist 目录使用
  - gulp-useref：处理文件引用问题，如在构建编译好 html 文件后，文件内仍旧保留了对 node_modules 资源的引用。可以使用 useref 中的 searchPath 去查询相关引用
  - gulp-if：在 useref 处理完资源引用问题，对编译后文件进行压缩处理时的类型判断，根据文件类型使用不同插件进行压缩，如 `pipe(plugins.if(/\.js$/, plugins.uglify()))`
  - gulp：构建工具
    - src
      - { base: 'src' }
    - dest
    - series
    - parallel
    - watch
- 开发环境相关：
  - browser-sync：创建本地开发环境下服务器，使用内容
    - `const browserSync = require('browser-sync');`
    - `const bs = browserSync.create();`
    - `bs.init(options)`, options 使用配置：
      - notify
      - files
      - server
        - baseDir
        - routes

## 实现步骤

### 1. 样式编译

```Javascript
const { src, dest } = require('gulp');
const gulpSass = require('gulp-sass');

const styles = () => {
  return src('src/assets/styles/*.scss', { base: 'src' })
    .pipe(gulpSass({ outputStyle: 'expanded' }))
    .pipe(dest('dist'));
}

module.exports = {
  styles
};
```

### 2. 脚本编译

```Javascript
const { src, dest } = require('gulp');
const gulpBabel = require('gulp-babel');

const scripts = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
    .pipe(gulpBabel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('dist'))
}

module.exports = {
  scripts
};
```

### 3. 模版编译

```Javascript
const { src, dest, parallel } = require('gulp');
const gulpSwig = require('gulp-swig');

const data = { ... }

const styles = () => { ... }

const scripts = () => { ... }

const pages = () => {
  return src('src/**/*.html', { base: 'src' })
    .pipe(gulpSwig({ data }))
    .pipe(dest('dist'))
}

const compile = parallel(styles, scripts, pages);

module.exports = {
  compile
};
```

### 4. 图片和字体文本转换

```Javascript
const { src, dest, parallel } = require('gulp');
const gulpImagemin = require('gulp-imagemin');

const data = { ... }

const styles = () => { ... }

const scripts = () => { ... }

const images = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(gulpImagemin())
    .pipe(dest('dist'))
};

const fonts = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(gulpImagemin())
    .pipe(dest('dist'))
};

module.exports = {
  images,
  fonts
};
```

### 5. 其他文件拷贝及文件清除

```Javascript
const { src, dest, parallel, series } = require('gulp');
const del = require('del');

const data = { ... }

const styles = () => { ... }

const scripts = () => { ... }

const pages = () => { ... }

const images = () => { ... }

const fonts = () => { ... }

const extra = () => {
  return src('public/**', { base: 'public' })
    .pipe(dest('dist'));
}

const clean = () => {
  return del(['dist'])
}

const compile = parallel(styles, scripts, pages, images, fonts);
const build = series(clean, parallel(compile, extra));

module.exports = {
  compile,
  build
};
```

### 6. 自动加载插件

```Javascript
// 安装依赖
yarn add -D gulp-load-plugins

// gulpfile.js 修改之前
const gulpSass = require('gulp-sass');
const gulpBabel = require('gulp-babel');
const gulpSwig = require('gulp-swig');
const gulpImage = require('gulp-imagemin');

// gulpfile.js 修改之后;
const loadPlugins = require('gulp-load-plugins');
const plugins = loadPlugins();

// 调用 gulpSass 的方法改成 plugins.sass
// 调用 gulpBabel 的方法改成 plugins.babel
// 调用 gulpSwig 的方法改成 plugins.swig
// 调用 gulpImage 的方法改成 plugins.imagemin
```

### 7. 开发服务器

```Javascript
const browserSync = require('browser-sync');

// 创建一个服务器
const bs = browserSync.create();

// 创建一个任务用于启动服务器，并增加相应配置
const serve = () => {
	bs.init({
  	server: {
    	baseDir: "dist", //设置服务根目录
      routes: {
        // 设置后 html 文件中 node_modules 目录下的资源文件请求就会映射到项目目录的 node_modules
        // value 使用的是相对路径
        // key 使用的是资源引用的目录名
        '/node_modules': 'node_modules'
      }
    }
  });
}
```

### 8. watch 文件 & 构建优化

```Javascript
...
const { src, dest, parallel, series, watch } = require('gulp');

const styles = () => {
  return src('src/assets/styles/*.scss', { base: 'src' })
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(dest('dist'))
    .pipe(bs.reload({ stream: true }));
}

const server = () => {
  watch('src/assets/styles/*.scss', styles);
  watch('src/assets/scripts/*.js', scripts);
  watch('src/**/*.html', pages);
  // watch('src/assets/images/**', images);
  // watch('src/assets/fonts/**', fonts);
  // watch('public/**', extra);
  watch(['src/assets/images/**', 'src/assets/fonts/**','public/**' ], bs.reload);

  bs.init({
    notify: false,
    port: 8080,
    // files: 'dist/**',
    server: {
      baseDir: ['dist', 'src', 'public'],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });
}
```

### 9. useref 处理文件引用

```Javascript
const useref = () => {
  return src('dist/*.html')
    .pipe(plugins.useref({ searchPath: ['dist', '.'] }))
    .pipe(dest('dist'));
}
```

### 10. 文件压缩

```Javascript
...
const useref = () => {
  return src('dist/*.html')
    .pipe(plugins.useref({ searchPath: ['dist', '.'] }))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(dest('release'));
}
...
```

### 11. 构建重构

目标：release 目录中不包含 images、fonts 资源文件
实现流程：
• 创建 temp 目录用来保存需要处理文件引用、压缩的资源，如 useref 任务
• scss、scripts、pages 任务 dest 改为 temp
• useref 任务 src 改为 temp
• bs.init 中 server 中 baseDir 配置 dist 改为 temp，dev 启动时静态资源去 temp 临时目录查找
• useref 文件流最后导出到 dist 目录
验证：
• dev
• compile & build


## 使用

* yarn gulp dev
* yarn guld build
* yarn guld clean
