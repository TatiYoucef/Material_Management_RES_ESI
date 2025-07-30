const fs = require('fs');
const path = require('path');

const dir = 'backend';
const subDirs = ['data', 'routes'];

subDirs.forEach(subDir => {
  fs.mkdirSync(path.join(dir, subDir), { recursive: true });
});