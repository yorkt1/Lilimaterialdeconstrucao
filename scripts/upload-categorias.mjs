// Roda com: node scripts/upload-categorias.mjs

const CLOUD_NAME    = 'dckhuy9ny';
const UPLOAD_PRESET = 'lili_produtos';

const categorias = [
  { key: 'materiais_construcao', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=300&fit=crop&auto=format' },
  { key: 'pisos_revestimentos',  url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&auto=format' },
  { key: 'tintas_acessorios',    url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=300&fit=crop&auto=format' },
  { key: 'ferramentas',          url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300&h=300&fit=crop&auto=format' },
  { key: 'hidraulica',           url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&h=300&fit=crop&auto=format' },
  { key: 'eletrica',             url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=300&fit=crop&auto=format' },
  { key: 'iluminacao',           url: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=300&h=300&fit=crop&auto=format' },
  { key: 'banheiro',             url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&h=300&fit=crop&auto=format' },
  { key: 'portas_janelas',       url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300&h=300&fit=crop&auto=format' },
];

async function upload(categoria) {
  const body = new FormData();
  body.append('file', categoria.url);
  body.append('upload_preset', UPLOAD_PRESET);
  body.append('public_id', `categorias/${categoria.key}`);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error(`❌ ${categoria.key}:`, data.error?.message);
    return null;
  }

  console.log(`✅ ${categoria.key}: ${data.secure_url}`);
  return { key: categoria.key, url: data.secure_url };
}

const resultados = [];
for (const cat of categorias) {
  const r = await upload(cat);
  if (r) resultados.push(r);
}

console.log('\n--- Cole no CategoryShowcase.jsx ---\n');
for (const r of resultados) {
  console.log(`key: '${r.key}' → '${r.url}'`);
}
