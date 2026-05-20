// Faz upload de imagens de categoria para o Cloudinary e imprime as URLs
// Rode com: node scripts/upload-category-images.js

import { createHash } from 'crypto';

const CLOUD  = 'dckhuy9ny';
const KEY    = '755987535329984';
const SECRET = 'fTp9SdpxEm6sehGBQgTHCux3v-g';

// Imagens de stock gratuitas (Pexels CDN, sem autenticação)
const CATEGORIES = [
  { key: 'materiais_construcao', src: 'https://images.pexels.com/photos/1301585/pexels-photo-1301585.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'pisos_revestimentos',  src: 'https://images.pexels.com/photos/1571457/pexels-photo-1571457.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'tintas_acessorios',    src: 'https://images.pexels.com/photos/1539078/pexels-photo-1539078.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'banheiro',             src: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'portas_janelas',       src: 'https://images.pexels.com/photos/164558/pexels-photo-164558.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'ferramentas',          src: 'https://images.pexels.com/photos/162553/pexels-photo-162553.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'eletrica',             src: 'https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'hidraulica',           src: 'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'iluminacao',           src: 'https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'ferragens',            src: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'jardim',               src: 'https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'seguranca',            src: 'https://images.pexels.com/photos/430208/pexels-photo-430208.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'soldagem',             src: 'https://images.pexels.com/photos/1145434/pexels-photo-1145434.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'moveis_armarios',      src: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'outros',               src: 'https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

function sign(params) {
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
  return createHash('sha1').update(sorted + SECRET).digest('hex');
}

async function upload(key, srcUrl) {
  const timestamp = Math.round(Date.now() / 1000);
  const public_id = `categorias/${key}`;
  const overwrite = 'true';

  const sigParams = { overwrite, public_id, timestamp };
  const signature = sign(sigParams);

  const body = new URLSearchParams({
    file: srcUrl,
    public_id,
    overwrite,
    timestamp: String(timestamp),
    api_key: KEY,
    signature,
  });

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: 'POST',
    body,
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

console.log('Fazendo upload das imagens de categoria para o Cloudinary...\n');

const results = {};
for (const { key, src } of CATEGORIES) {
  process.stdout.write(`  ${key.padEnd(22)} `);
  try {
    const url = await upload(key, src);
    results[key] = url;
    console.log(`✓  ${url}`);
  } catch (e) {
    console.log(`✗  ERRO: ${e.message}`);
  }
}

console.log('\n\n=== Copie as linhas abaixo para categories.js ===\n');
for (const [key, url] of Object.entries(results)) {
  console.log(`  image: '${url}', // ${key}`);
}
