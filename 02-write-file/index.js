const process = require("process");
const readline = require('readline');
const fs = require("fs");
const path = require('path');

const rl = readline.createInterface({ input: process.stdin, output:process.stdout });
let writeStream;

rl.question("Input file name\n", (ans) => {
  checkText (ans);
  writeStream = fs.createWriteStream(path.join(__dirname, `${ans}.txt`));
  console.log(`\nYour file is ${ans}.txt\n`);
  askQuestion(ans);
})

function askQuestion(filename) {
  rl.question(`Input text for writing in ${filename}.txt\n`, (ans) => {
    checkText (ans);
    writeStream.write(ans + "\n");
    askQuestion(filename);
  })
}

//Эта дурацкая команда не работает в консоли баша в вскоде. Проверьте, плиз, в cmd или power shell (хотя можт это у меня не работает, а у вас всё ок будет)
rl.on("SIGINT", () => {
  console.log("\nУдачи в нашем нелёгком деле =)\n");
  process.exit();
});

function checkText(text) {
  if (text === "exit") {
    console.log("\nУдачи в нашем нелёгком деле =)\n");
    process.exit();
  }
}