const args = require("minimist")(process.argv.slice(2));
const { resolve } = require("path");
const { build } = require("esbuild");

// yarn dev: node ./scripts/dev reactivity --format=global
const target = args._[0] || "reactivity";
const format = args.format || "global";

const pkg = require(resolve(__dirname, `../packages/${target}/package.json`));
const outoutFormat =
  format === "global" ? "iife" : format === "cjs" ? "cjs" : "esm";

const outfile = resolve(
  __dirname,
  `../packages/${target}/dist/${target}.${format}.js`
);
// reactivity/dist/reactivity.global.js
// index.html中 window.Vue window.VueReactivity

build({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
  outfile,
  format: outoutFormat,
  sourcemap: true,
  globalName: pkg?.buildOptions?.name,
  bundle: true, // 把你依赖的包打包进来
  watch: {
    onRebuild (err) {
      if (!err) console.log("~~~");
    },
  },
}).then(() => {
  console.log("启动成功");
});
