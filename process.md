# 使用 gulp 完成项目构建

## 一、实现功能

- [x] html 模版、sass/ES6+ 编译、images/fonts 压缩
- [x] 资源压缩
- [x] dev-server
- [x] 指令合并
- [x] 发布到 npm，可通过指令构建

## 二、使用工具

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

## 三、实现步骤

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

## 四、使用

- yarn gulp dev
- yarn gulp build
- yarn gulp clean

## 五、封装工作流

### 1、目标

- 提取 gulp，配合 yarn link 实现本地调试，修复执行异常
- 抽象配置路径
- 包装 gulp cli
- 发布 & 应用

### 2、过程

#### 2.1 提取 gulp

- 将步骤三中的 src、public 等资源文件单独提取到一个目录（项目目录）中，当前目录（模块目录）只保留 gulp 相关内容
- package.json 中的非开发依赖移除，开发依赖改为 dependencies
- 项目中新建 lib/index.js 并将 gulpfile.js 中文件全部复制到此文件后，可删除 gulpfile.js
- package.json 中入口文件修改为 lib/index.js，使用 yarn link 将当前模块链接到全局
- 在项目目录根目录中安装依赖 bootstrap jquery popper.js，并在根目录创建 gulpfile.js 文件，文件内中直接require打包模块
- 暂时在项目目录中安装 gulp gulp-cli 指令，后续集成
- 执行 yarn gulp build 等指令，修复其中的报错

#### 2.2 抽象配置路径

- 项目目录下创建 gulppages.config.js 其中内容结构与模块目录中 lib/index.js 中 pathConfig 保持一致
- lib/index.js 尝试读取项目目录中配置，如果无则使用模块中默认配置，否则使用项目配置

#### 2.3 指令化

- 指令化需要在模块根目录下增加 bin/index.js 文件，并在 package.json 中指定 bin 执行文件。macos 中需要将 bin/index.js 改为 755 可执行文件。
- bin/index.js 中需要完成的内容是模拟 gulp-cli 的构建指令：`yarn gulp build --gulfile gulpfile-path --cwd path`
- 通过 process.argv 传入 gulpfile cwd 参数
- 观察项目目录中 node_modules/.bin/gulp 执行的内容，仿照其引入 gulp-cli 即可。

#### 2.4 发布

- yarn publish --registry=https://registry.yarnpackage.com

#### 2.5 使用

- 由于 gulp-cli 已经集成到模块中，所以项目目录中可删除 gulp gulp-cli 依赖
- yarn add -D [模块名称]
- [模块名称] build：完成构建
- 在 package.json 中添加 build dev clean 任务指令
