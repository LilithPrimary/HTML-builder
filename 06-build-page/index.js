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

function checkHTML(HTML) {
  if(HTML.indexOf('{{') !== -1) {
    const start = HTML.indexOf('{{');
    const end = HTML.indexOf('}}');
    const readStream = fs.createReadStream(path.resolve(htmlDir, `${HTML.slice(start + 2, end)}.html`), 'utf-8');
    let component = '';
    readStream.on('data', (chunk) => component += chunk);
    readStream.on('end', () => {
      HTML = HTML.replace(HTML.slice(start - 4, end + 2), component);
      checkHTML(HTML);
    });
  } else {
    const writeStream = fs.createWriteStream(path.resolve(targDir, 'index.html'), 'utf-8');
    writeStream.write(HTML);
  }
}

function bundleHTML() {
  let readStream = fs.createReadStream(path.resolve(__dirname, 'template.html'), 'utf-8');
  let HTML = '';
  readStream.on('data', (chunk) => HTML += chunk);
  readStream.on('end', () => {
    checkHTML(HTML);
  });
}

function fileCopy (curDir, targDir, file) {
  fs.copyFile( path.join(curDir, file.name), path.join(targDir, file.name), err => {
    if (err) throw err;
  });
}

async function copying(curDir, targDir) {
  try {
    await fs.promises.mkdir(targDir, { recursive: true });
    let files = await fsProm.readdir(curDir, {withFileTypes: true});
    for (let el of files) {
      if (el.isFile()) {
        fileCopy(curDir, targDir, el);
      } else {
        copying(path.join(curDir, el.name), path.join(targDir, el.name));
      }
    }
  } catch (error) {
    console.log(`Error with copy files ${error}`);
  }

}

async function bundleCSS() {
  try {
    const writeStream = fs.createWriteStream(path.resolve(targDir, 'style.css'));
    let files = await fsProm.readdir(styleDir, {withFileTypes: true});
    files = files.reverse();
    files.forEach(el => {
      if(el.isFile()) {
        const filePath = path.resolve(styleDir, el.name);
        if (path.extname(filePath) === '.css') {
          const readStream = fs.createReadStream(filePath);
          readStream.pipe(writeStream, {end: false});
        }
      }
    });
  } catch (error) {
    console.log(`Error in bundleCSS: ${error}`);
  }
}

function createProject() {
  bundleHTML();
  copying(path.resolve(__dirname, 'assets'), path.resolve(targDir, 'assets'));
  bundleCSS();
}