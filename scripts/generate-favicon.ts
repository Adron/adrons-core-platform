import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateFavicon() {
  // Define sizes for different use cases
  const sizes = [16, 32, 48, 64, 128, 256];
  
  try {
    // Generate PNGs for each size
    const pngBuffers = await Promise.all(
      sizes.map(size =>
        sharp(path.join(process.cwd(), 'public', 'favicon.svg'))
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer()
      )
    );

    // Write the PNG buffers to files
    await Promise.all(
      pngBuffers.map((buffer, i) =>
        fs.promises.writeFile(
          path.join(process.cwd(), 'public', `favicon-${sizes[i]}.png`),
          buffer
        )
      )
    );

    // Create favicon.ico from the smaller sizes (16, 32, 48)
    const { execSync } = require('child_process');
    execSync(
      `convert ${[16, 32, 48]
        .map(size => `public/favicon-${size}.png`)
        .join(' ')} public/favicon.ico`
    );

    // Clean up temporary PNG files
    await Promise.all(
      sizes.map(size =>
        fs.promises.unlink(path.join(process.cwd(), 'public', `favicon-${size}.png`))
    ));

    console.log('Favicon generation completed successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    throw error;
  }
}

generateFavicon().catch(console.error); 