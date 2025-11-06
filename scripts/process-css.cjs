const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');

const cssPath = path.resolve(__dirname, '..', 'tailwind.css');
const css = fs.readFileSync(cssPath, 'utf8');

postcss([tailwindcss])
  .process(css, { from: cssPath })
  .then(result => {
    console.log('Processed CSS length:', result.css.length);
  })
  .catch(err => {
    console.error('PostCSS error:');
    console.error(err.stack || err.message || err);
    process.exit(1);
  });
