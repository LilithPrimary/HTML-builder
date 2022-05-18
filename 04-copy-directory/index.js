const path = require('path');
const fs = require('fs');

const oldPath = path.join(__dirname, 'files');
const newPath = path.join(__dirname, 'files-copy');

fs.access(newPath, (err) => {
  if (err) {
    copying(oldPath, newPath);
  }
  else fs.rm(newPath, { recursive: true }, (err) => {
    if (err) throw err;
    copying(oldPath, newPath);
  });
});

function createDir(dir) {
  fs.mkdir(dir, (err) => {
    if (err) throw err;
  });
}

function fileCopy (curDir, targDir, file) {
  fs.copyFile( path.join(curDir, file.name), path.join(targDir, file.name), err => {
    if (err) throw err;
  });
}

function copying(curDir, targDir) {
  createDir(targDir);
  fs.readdir(curDir, {withFileTypes: true}, (err, items) => {
    items.forEach(el => {
      if (el.isFile()) {
        fileCopy(curDir, targDir, el);
      } else {
        copying(path.join(curDir, el.name), path.join(targDir, el.name));
      }
    });
  });
}