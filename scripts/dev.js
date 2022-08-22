const args = require("minimist")(process.argv.slice(2));
const { resolve } = require("path");
const { build } = require("esbuild");

const target = args._[0] || "reactivity";
const format = args.format || "global";
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`));
const outputFormat =
  format === "global" ? "iife" : format === "cjs" ? "cjs" : "esm";

const outfile = resolve(
  __dirname,
  `../packages/${target}/dist/${target}.${format}.js`
);

build({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)], // 入口文件
  outfile, // 输出文件
  sourcemap: true, // 开启 sourcemap
  bundle: true, // 打包引入的模块
  format: outputFormat, // 打包格式
  globalName: pkg?.buildOptions?.name, // 全局名称 window.xxxx
  watch: {
    onRebuild(err) {
      if (!err) console.log("rebuilt~~~");
    },
  },
}).then(() => {
  console.log("watch~~~");
});
