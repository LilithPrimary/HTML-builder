const fs = require('fs');
const path = require('path');

fs.readdir(path.join(__dirname, 'secret-folder'), {withFileTypes: true}, (err, items) => {
  const files = items.filter(el => el.isFile());
  files.forEach(el => {
    const elPath = path.join(__dirname, 'secret-folder', el.name);
    fs.stat(elPath, (err, stats) => {
      if (err) throw err;
      console.log([path.parse(elPath).name, path.extname(elPath).slice(1), Math.round(stats.size/1024) + 'kb'].join(' - '));
    });
  }); 
});