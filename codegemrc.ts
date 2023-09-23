import { defineConfig } from "codegem";
import loadFile from "codegem-load-file";
// @ts-ignore
import createSvg from "../../build/index.js";
export default defineConfig({
  output: "example", // 根目录;所有生成文件统一生成在这个目录下
  factory: [
    {
      use: [loadFile("./example")],
      machine: createSvg(),
      name: "svgIcons",
    },
  ],
});
