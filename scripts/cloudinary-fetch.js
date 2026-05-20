// Busca todas as imagens do Cloudinary e salva em public/cloudinary-images.json
// Rode com: node scripts/cloudinary-fetch.js

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CLOUD  = 'dckhuy9ny';
const KEY    = '755987535329984';
const SECRET = 'fTp9SdpxEm6sehGBQgTHCux3v-g';
const AUTH   = Buffer.from(`${KEY}:${SECRET}`).toString('base64');

async function listPage(cursor) {
  const qs = `max_results=500${cursor ? `&next_cursor=${cursor}` : ''}`;
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/resources/image?${qs}`,
    { headers: { Authorization: `Basic ${AUTH}` } }
  );
  return res.json();
}

const all = [];
let cursor = null;

console.log('Buscando imagens no Cloudinary...\n');

do {
  const data = await listPage(cursor);
  if (data.error) {
    console.error('Erro:', data.error.message);
    process.exit(1);
  }
  for (const r of data.resources) {
    all.push({ url: r.secure_url, public_id: r.public_id, created_at: r.created_at });
  }
  cursor = data.next_cursor || null;
  process.stdout.write(`\r${all.length} imagens encontradas...`);
} while (cursor);

console.log(`\n\n✓ Total: ${all.length} imagens`);

const outPath = join(__dirname, '..', 'public', 'cloudinary-images.json');
writeFileSync(outPath, JSON.stringify(all, null, 2));
console.log(`✓ Salvo em public/cloudinary-images.json`);
console.log('\n→ Agora acesse /admin/importar para cadastrar os produtos.');
