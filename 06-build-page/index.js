const fs = require('fs');
const fsProm = require('fs/promises');
const path = require('path');

const targDir = path.resolve(__dirname, 'project-dist');
const styleDir = path.resolve(__dirname, 'styles');
const htmlDir = path.resolve(__dirname, 'components');

fs.access(targDir, async (err) => {
  if (err) {
    await fsProm.mkdir(targDir);
    createProject();
  }
  else {
    await fsProm.rm(targDir, { recursive: true });
    await fsProm.mkdir(targDir, { recursive: true });
    createProject();
  }
});

async function workWithHTML() {
  let HTML = await fsProm.readFile(path.resolve(__dirname, 'template.html'), 'utf-8');
  let files = await fsProm.readdir(htmlDir, {withFileTypes: true});
  let components = {};
  for (let el of files) {
    if(el.isFile()) {
      const filePath = path.resolve(htmlDir, el.name);
      if (path.extname(filePath) === '.html') {
        components[path.parse(filePath).name] = await fsProm.readFile(filePath, 'utf-8');
      }
    }
  }
  while(HTML.indexOf('{{') !== -1) {
    const start = HTML.indexOf('{{');
    const end = HTML.indexOf('}}');
    HTML = HTML.replace(HTML.slice(start - 4, end + 2), components[HTML.slice(start + 2, end)]);
  }
  await fsProm.writeFile(path.resolve(targDir, 'index.html'), HTML);
}

function fileCopy (curDir, targDir, file) {
  fs.copyFile( path.join(curDir, file.name), path.join(targDir, file.name), err => {
    if (err) throw err;
  });
}

async function copying(curDir, targDir) {
  await fs.promises.mkdir(targDir, { recursive: true });
  let files = await fsProm.readdir(curDir, {withFileTypes: true});
  for (let el of files) {
    if (el.isFile()) {
      fileCopy(curDir, targDir, el);
    } else {
      copying(path.join(curDir, el.name), path.join(targDir, el.name));
    }
  }
}

async function bundleCSS() {
  const writeStream = fs.createWriteStream(path.resolve(targDir, 'style.css'));
  const files = await fsProm.readdir(styleDir, {withFileTypes: true});
  files.forEach(el => {
    if(el.isFile()) {
      const filePath = path.resolve(styleDir, el.name);
      if (path.extname(filePath) === '.css') {
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(writeStream);
      }
    }
  });
}

function createProject() {
  workWithHTML();
  copying(path.resolve(__dirname, 'assets'), path.resolve(targDir, 'assets'));
  bundleCSS();
}