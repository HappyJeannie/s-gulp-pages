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

## 使用
