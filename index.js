import fs from "fs";
import { Transform } from "stream";

const path = "./storage/access.log";

function randomizer(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

const stringGenerator = () => {
  const ip = `${randomizer(1, 254)}.${randomizer(1, 254)}.${randomizer(
    1,
    254
  )}.${randomizer(1, 254)}`;
  const date = new Date(randomizer(1, Date.now()));
  const query = ["POST", "GET"];
  const serverAnswer = ["200", "404", "500"];
  return `${ip} - - [${date} -0300] "${
    query[randomizer(0, query.length)]
  } /boo HTTP/1.1"
${serverAnswer[randomizer(0, serverAnswer.length)]} 0 "-" "curl/7.47.0"\n`;
};

fs.exists(path, () => {
  const writeStream = fs.createWriteStream(path, {
    flags: "a+",
    encoding: "utf8",
  });
  while (fs.statSync(path).size < 104857600) {
    console.clear(); // console.log(Math.round(fs.statSync(path).size)); // pushArray(); //
    writeStream.write(stringGenerator() + "");
    // Без стрима //
    fs.writeFileSync(path, stringGenerator(), {
      flag: "a",
      encoding: "utf-8",
    });

    fs.writeFile(
      path,
      stringGenerator(),
      { flag: "a", encoding: "utf-8" },
      (err) => console.log(err)
    );
  }
  writeStream.end(() => console.log("File writing finished"));
});

const arrIp = ["240.85.195.60", "160.13.46.6"];
arrIp.map((ip) => {
  const readStream = fs.createReadStream(path, "utf8");
  const writeStream = fs.createWriteStream(`./storage/filtered_${ip}.log`, {
    flags: "a+",
    encoding: "utf8",
  });
  const tStream = new Transform({
    transform(chunk, encoding, callback) {
      const regExp = new RegExp(ip, "g");
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
  readStream.on("end", () => console.log("File reading finished!"));
});
