const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const input = path.join(__dirname, '..', 'client', 'src', 'assets', 'HomeImage', 'Home1.png');
const output = path.join(__dirname, '..', 'client', 'src', 'assets', 'HomeImage', 'Home1.webp');

console.log(`Starting to optimize: ${input}`);

sharp(input)
  .resize(1920) // resize to match max Full HD width
  .webp({ quality: 80 })
  .toFile(output)
  .then(info => {
    console.log('Image optimized and saved as WebP successfully!');
    console.log(info);
    
    // Optional: remove old massive png to save space
    // fs.unlinkSync(input);
  })
  .catch(err => {
    console.error('Error optimizing image:', err);
  });
