const sharp = require('sharp');

export async function optimizeImage(buffer: Buffer) {
  return sharp(buffer)
    .resize(400, 400, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 80 })
    .toBuffer();
} 