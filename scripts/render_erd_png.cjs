const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const svgFile = path.resolve(__dirname, '..', 'database_erd.svg');
const pngFile = path.resolve(__dirname, '..', 'database_erd.png');

console.log('SVG:', svgFile);
console.log('PNG:', pngFile);

try {
  execFileSync(edgePath, [
    '--headless',
    '--disable-gpu',
    `--screenshot=${pngFile}`,
    '--window-size=2800,2000',
    `file:///${svgFile.replace(/\\/g, '/')}`
  ]);
  console.log('Screenshot finished. File exists:', fs.existsSync(pngFile));
  if (fs.existsSync(pngFile)) {
    console.log('File size:', fs.statSync(pngFile).size);
  }
} catch (err) {
  console.error('Exec error:', err);
}
