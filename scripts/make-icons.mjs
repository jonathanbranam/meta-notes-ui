// Writes client/public/icon-192.png and icon-512.png: a solid rounded tile with a "note" mark.
// Run by hand when the icon changes; the PNGs are committed.
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (b) => {
  let c = 0xffffffff;
  for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
};

function png(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size;
      // A light page with three text lines on a blue tile (kept inside the maskable safe zone).
      const page = u > 0.28 && u < 0.72 && v > 0.2 && v < 0.8;
      const line = page && u > 0.35 && u < 0.65 && [0.32, 0.46, 0.6].some((c) => Math.abs(v - c) < 0.02);
      const [r, g, b] = line ? [59, 130, 246] : page ? [255, 255, 255] : [59, 130, 246];
      const i = y * (size * 4 + 1) + 1 + x * 4;
      raw.set([r, g, b, 255], i);
    }
  }
  const head = Buffer.alloc(13);
  head.writeUInt32BE(size, 0);
  head.writeUInt32BE(size, 4);
  head.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", head), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

for (const size of [192, 512]) writeFileSync(new URL(`../client/public/icon-${size}.png`, import.meta.url), png(size));
