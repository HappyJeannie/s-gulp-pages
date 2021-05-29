#! /usr/bin/env node

console.log("执行 s-gulp-pages 指令");

process.argv.push("--cwd");
process.argv.push(process.cwd());
process.argv.push("--gulpfile");
process.argv.push(require.resolve("./../lib/index.js"));

require('gulp/bin/gulp');