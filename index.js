import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import colors from "colors";
import moment from "moment";
import "moment-duration-format";

let arrIntervals = [];
let arr = [];
const rl = readline.createInterface({ input, output });
let state = "green";
console.log("Введите диапазон проверяемых значений через запятую");
console.log("Или введите дату в формате ss-mm-HH-DD-MM-YY");
rl.on("line", (input) => {
  if (input === "exit") return rl.close();
  if (input.split(",").length === 2) {
    const [int1, int2] = input
      .split(",")
      .sort()
      .map((i) => +i);
    nextPrime: for (let i = int1; i <= int2; i++) {
      for (let j = 2; j < i; j++) {
        if (i % j === 0) continue nextPrime;
      }
      arr.push(i);
    }
    if (arr.length === 0) {
      console.log(
        "В указанном диапазоне нет чисел! Попробуйте ввести диапазон снова"
      );
    }
    arr.forEach((item) => {
      if (state === "green") {
        console.log(colors.green(item));
        state = "yellow";
      } else if (state === "yellow") {
        console.log(colors.yellow(item));
        state = "red";
      } else {
        console.log(colors.red(item));
        state = "green";
      }
    });
  }
  if (input.split("-").length === 6) {
    const [ss, mm, HH, DD, MM, YY] = input.split("-").map((i) => +i);
    const bindTime = moment(
      `${YY},${MM},${DD},${HH},${mm},${ss}`,
      "YY,MM,DD,HH,mm,ss"
    ).unix();
    function timer(bindTime) {
      let diffTime = bindTime - moment().unix();
      let duration = moment
        .duration(diffTime * 1000, "milliseconds")
        .asMilliseconds();
      const interval = setInterval(() => {
        duration = moment.duration(duration - 1000, "milliseconds");
        console.log(duration.format("s-m-h-d-M-y"));
      }, 1000);
      arrIntervals.push(interval);
    }
    timer(bindTime);
  }
  if (input === "clearIntervals") {
    arrIntervals.map((i) => {
      clearInterval(i);
    });
  }
});
