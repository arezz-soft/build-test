const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\HelpTech\\.gemini\\antigravity\\brain\\9fd80f79-2463-4cc9-b90c-7331cdb29409\\premium_b_icon_design_1768815634145.png';
const destSvg = 'public/favicon.svg';
const destIco = 'public/favicon.ico';

// 1. Read the source PNG
const pngBuffer = fs.readFileSync(srcPath);
const base64Png = pngBuffer.toString('base64');

// 2. Generate SVG with embedded base64 image
// We wrap it in an <image> tag. preserving aspect ratio
const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <image href="data:image/png;base64,${base64Png}" width="512" height="512" />
</svg>`;

fs.writeFileSync(destSvg, svgContent);
console.log(`Created ${destSvg}`);

// 3. Generate a simple ICO file
// ICO format is a container. We can put the PNG directly inside for modern browsers (Vista+)
// Header: 00 00 (Reserved) | 01 00 (Type 1=ICO) | 01 00 (Count=1)
// Entry: Width(1) Height(1) Colors(1) Res(1) Planes(2) BPP(2) Size(4) Offset(4)

const width = 0; // 0 means 256 or larger
const height = 0;
const colors = 0;
const reserved = 0;
const planes = 1; // 1 color plane
const bpp = 32; // 32 bits per pixel
const size = pngBuffer.length;
const offset = 22; // 6 (header) + 16 (one entry)

const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // Reserved
header.writeUInt16LE(1, 2); // Type 1 (ICO)
header.writeUInt16LE(1, 4); // Count 1

header.writeUInt8(width, 6);
header.writeUInt8(height, 7);
header.writeUInt8(colors, 8);
header.writeUInt8(reserved, 9);
header.writeUInt16LE(planes, 10);
header.writeUInt16LE(bpp, 12);
header.writeUInt32LE(size, 14);
header.writeUInt32LE(offset, 18);

const icoBuffer = Buffer.concat([header, pngBuffer]);
fs.writeFileSync(destIco, icoBuffer);
console.log(`Created ${destIco}`);
