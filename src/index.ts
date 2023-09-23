import { FileType } from "codegem-load-file";
import fs from "node:fs";
import path from "node:path";
import prettier from "prettier";

export default function createSvg(data?: { filename?: string }) {
  return (source: FileType[]) => {
    const codes = source[0].filesInfo.map((item) => {
      const name = path.basename(item.path, path.extname(item.path));
      const className = `.icon-${name}`;
      const svgData = fs.readFileSync(item.path, "utf-8");
      const dataUri = `data:image/svg+xml;utf8,${encodeSvg(svgData)}`;
      const mode = getMode(svgData);
      if (mode === "mask") {
        return `
          ${className} {
            -webkit-mask: url("${dataUri}") no-repeat center;
            -webkit-mask-size: cover;
            background-color: #333;
            height: 50px;
            width: 50px;
            display: inline-block;
          }
        `;
      }
      return `
      ${className} {
        background: url("${dataUri}") no-repeat center;
        background-color: transparent;
        background-size: cover;
        height: 50px;
        width: 50px;
        display: inline-block;
      }
      `;
    });
    const formateCode = prettier.format(codes.join(""), {
      printWidth: 80,
      tabWidth: 2,
      trailingComma: "all",
      parser: "css",
    });
    // console.log(formateCode);
    return [
      {
        pathname: data?.filename ?? path.resolve("./src", "icons.css"),
        code: formateCode,
      },
    ];
  };
}

function getMode(svgData: string): "mask" | "background" {
  const result = svgData.matchAll(/fill="(#\w{6})"/gi);
  const list = [...result];
  const colors = Array.from(new Set(list.map((it) => it[1])));
  // console.log(list.length, new Set(list.map((it) => it[1])));
  const mode = list.length <= 1 || colors.length === 0 ? "mask" : "background";
  return mode;
}

function encodeSvg(svg: string) {
  return svg
    .replace(
      "<svg",
      ~svg.indexOf("xmlns") ? "<svg" : '<svg xmlns="http://www.w3.org/2000/svg"'
    )
    .replace(/"/g, "'")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/{/g, "%7B")
    .replace(/}/g, "%7D")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/\n|\r/g, "");
}
