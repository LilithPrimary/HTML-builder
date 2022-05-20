const fs = require('fs');
const fsProm = require('fs/promises');
const path = require('path');

const curDir = path.resolve(__dirname, 'styles');
const targDir = path.resolve(__dirname, 'project-dist');
const writeStream = fs.createWriteStream(path.resolve(targDir, 'bundle.css'));

async function bundle() {
  const files = await fsProm.readdir(curDir, {withFileTypes: true});
  files.forEach(el => {
    if(el.isFile()) {
      const filePath = path.resolve(curDir, el.name);
      if (path.extname(filePath) === '.css') {
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(writeStream, {end: false});
      }
    }
  });
}
bundle();