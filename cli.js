#! C:\\Program Files\\nvm\\v18.10.0

import fs from "fs";
import * as path from "path";
import inquirer from "inquirer";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

import _yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Transform } from "stream";

const yargs = _yargs(hideBin(process.argv));

const options = yargs.usage("Usage -p ").options({
  f: {
    alias: "filter",
    describe: "Filter to file",
    type: "string",
    demandOption: true,
  },
}).argv;
let currentDir = __dirname;

const checkDir = (filePath) => {
  return fs.lstatSync(path.join(currentDir, filePath)).isDirectory();
};

const inq = async () => {
  const list = await fs.readdirSync(currentDir);
  list.unshift("./");
  const iteration = await inquirer
    .prompt([
      {
        name: "file",
        type: "list",
        message: "Choose: ",
        choices: list,
      },
    ])
    .then((answer) => answer);
  if (iteration.file === "./") {
    currentDir = currentDir.split("\\").slice(0, -1).join("\\");
    return await inq();
  }
  if (checkDir(iteration.file)) {
    const arr = currentDir.split("\\");
    arr.push(iteration.file);
    currentDir = arr.join("\\");
    return await inq();
  } else {
    const readStream = fs.createReadStream(
      path.join(currentDir, iteration.file),
      "utf8"
    );
    const writeStream = fs.createWriteStream(
      path.join(__dirname, `./storage/filtered_${options.f}.log`),
      {
        flags: "a+",
        encoding: "utf8",
      }
    );
    const tStream = await new Transform({
      transform(chunk, encoding, callback) {
        console.log(chunk.toString());
        const regExp = new RegExp(options.f, "g");
        if (regExp.test(chunk.toString())) {
          const arr = `${chunk
            .toString()
            .split("\n")
            .filter((el) => {
              return regExp.test(el);
            })
            .join("")} \n`;
          this.push(arr);
        }
        callback();
      },
    });
    readStream.pipe(tStream).pipe(writeStream);
    readStream.on("end", () => inq());
  }
};
inq();
