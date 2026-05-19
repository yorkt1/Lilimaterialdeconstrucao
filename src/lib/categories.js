export const CATEGORIES = [
  // ── Nível 1 ──────────────────────────────────────────────────────────────
  { key: 'materiais_construcao',  label: 'Materiais de Construção' },
  { key: 'pisos_revestimentos',   label: 'Pisos e Revestimentos' },
  { key: 'tintas_acessorios',     label: 'Tintas e Acessórios' },
  { key: 'banheiro',              label: 'Banheiro' },
  { key: 'portas_janelas',        label: 'Portas e Janelas' },
  { key: 'ferramentas',           label: 'Ferramentas' },
  { key: 'eletrica',              label: 'Elétrica' },
  { key: 'hidraulica',            label: 'Hidráulica' },
  { key: 'iluminacao',            label: 'Iluminação' },

  // ── Materiais de Construção → Nível 2 ────────────────────────────────────
  { key: 'alvenaria',             label: 'Alvenaria',                       parent: 'materiais_construcao' },
  { key: 'calhas_pluvial',        label: 'Calhas e Sistema Pluvial',        parent: 'materiais_construcao' },
  { key: 'cercados_arame',        label: 'Cercados e Arame Farpado',        parent: 'materiais_construcao' },
  { key: 'drywall',               label: 'Drywall',                         parent: 'materiais_construcao' },
  { key: 'impermeabilizacao',     label: 'Impermeabilização e Vedação',     parent: 'materiais_construcao' },
  { key: 'lonas_plasticos',       label: 'Lonas e Plásticos',               parent: 'materiais_construcao' },
  { key: 'madeiras',              label: 'Madeiras para Construção',        parent: 'materiais_construcao' },
  { key: 'sacos_construcao',      label: 'Sacos para Construção',           parent: 'materiais_construcao' },
  { key: 'telhas',                label: 'Telhas',                          parent: 'materiais_construcao' },
  { key: 'forros_acessorios',     label: 'Forros e Acessórios',             parent: 'materiais_construcao' },
  { key: 'tijolos_blocos',        label: 'Tijolos e Blocos',                parent: 'materiais_construcao' },
  { key: 'elementos_vazados',     label: 'Elementos Vazados',               parent: 'materiais_construcao' },
  { key: 'ripados',               label: 'Ripados',                         parent: 'materiais_construcao' },

  // ── Impermeabilização → Nível 3 ──────────────────────────────────────────
  { key: 'colas_silicones',       label: 'Colas e Silicones',               parent: 'impermeabilizacao' },
  { key: 'impermeabilizantes',    label: 'Impermeabilizantes',              parent: 'impermeabilizacao' },
  { key: 'vedantes',              label: 'Vedantes',                        parent: 'impermeabilizacao' },
  { key: 'resinas',               label: 'Resinas',                         parent: 'impermeabilizacao' },
  { key: 'selantes',              label: 'Selantes',                        parent: 'impermeabilizacao' },
  { key: 'mantas',                label: 'Mantas',                          parent: 'impermeabilizacao' },

  // ── Pisos e Revestimentos → Nível 2 ──────────────────────────────────────
  { key: 'acessorios_assentamento', label: 'Acessórios Para Assentamento',  parent: 'pisos_revestimentos' },
  { key: 'argamassas',            label: 'Argamassas',                      parent: 'pisos_revestimentos' },
  { key: 'limpadores_acidos',     label: 'Limpadores e Ácidos Para Cerâm.', parent: 'pisos_revestimentos' },
  { key: 'pastilhas',             label: 'Pastilhas',                       parent: 'pisos_revestimentos' },
  { key: 'pedras_naturais',       label: 'Pedras Naturais',                 parent: 'pisos_revestimentos' },
  { key: 'pecas_decorativas',     label: 'Peças Decorativas',               parent: 'pisos_revestimentos' },
  { key: 'pisos_ceramicos',       label: 'Pisos Cerâmicos',                 parent: 'pisos_revestimentos' },
  { key: 'pisos_laminados',       label: 'Pisos Laminados e Acessórios',    parent: 'pisos_revestimentos' },
  { key: 'pisos_vinilicos',       label: 'Pisos Vinílicos',                 parent: 'pisos_revestimentos' },
  { key: 'rejuntes',              label: 'Rejuntes',                        parent: 'pisos_revestimentos' },
  { key: 'revestimentos_ceram',   label: 'Revestimentos Cerâmicos',         parent: 'pisos_revestimentos' },
  { key: 'rodameio',              label: 'Rodameio',                        parent: 'pisos_revestimentos' },
  { key: 'rodapes',               label: 'Rodapés',                         parent: 'pisos_revestimentos' },
  { key: 'porcelanatos',          label: 'Porcelanatos',                    parent: 'pisos_revestimentos' },
  { key: 'soleiras',              label: 'Soleiras',                        parent: 'pisos_revestimentos' },

  // ── Acessórios Para Assentamento → Nível 3 ───────────────────────────────
  { key: 'cantoneiras',           label: 'Cantoneiras',                     parent: 'acessorios_assentamento' },
  { key: 'cunhas',                label: 'Cunhas',                          parent: 'acessorios_assentamento' },
  { key: 'espacadores_juntas',    label: 'Espaçadores e Juntas',            parent: 'acessorios_assentamento' },
  { key: 'cortador_pisos',        label: 'Cortador de Pisos e Cerâmicas',   parent: 'acessorios_assentamento' },

  // ── Tintas e Acessórios → Nível 2 ───────────────────────────────────────
  { key: 'tintas_internas',        label: 'Tintas para Interiores',         parent: 'tintas_acessorios' },
  { key: 'tintas_externas',        label: 'Tintas para Exteriores',         parent: 'tintas_acessorios' },
  { key: 'texturas',               label: 'Texturas e Grafiatos',           parent: 'tintas_acessorios' },
  { key: 'vernizes_complementos',  label: 'Vernizes e Complementos',        parent: 'tintas_acessorios' },
  { key: 'massa_corrida',          label: 'Massa Corrida e Niveladora',     parent: 'tintas_acessorios' },
  { key: 'primers_fundo',          label: 'Primers e Fundo Preparador',     parent: 'tintas_acessorios' },
  { key: 'rolos_pinceis',          label: 'Rolos, Pincéis e Trinchas',     parent: 'tintas_acessorios' },
  { key: 'fitas_lixa',             label: 'Fitas e Lixas',                  parent: 'tintas_acessorios' },

  // ── Banheiro → Nível 2 ──────────────────────────────────────────────────
  { key: 'chuveiros_duchas',       label: 'Chuveiros e Duchas',             parent: 'banheiro' },
  { key: 'vasos_sanitarios',       label: 'Vasos Sanitários',               parent: 'banheiro' },
  { key: 'cubas_pias',             label: 'Cubas e Pias',                   parent: 'banheiro' },
  { key: 'torneiras_misturadores', label: 'Torneiras e Misturadores',       parent: 'banheiro' },
  { key: 'box_espelhos',           label: 'Box e Espelhos',                 parent: 'banheiro' },
  { key: 'acessorios_banheiro',    label: 'Acessórios para Banheiro',       parent: 'banheiro' },
  { key: 'aquecedores',            label: 'Aquecedores de Água',            parent: 'banheiro' },

  // ── Portas e Janelas → Nível 2 ──────────────────────────────────────────
  { key: 'portas_madeira',         label: 'Portas de Madeira',              parent: 'portas_janelas' },
  { key: 'portas_aluminio',        label: 'Portas de Alumínio',             parent: 'portas_janelas' },
  { key: 'portas_vidro',           label: 'Portas de Vidro',                parent: 'portas_janelas' },
  { key: 'janelas_aluminio',       label: 'Janelas de Alumínio',            parent: 'portas_janelas' },
  { key: 'janelas_vidro',          label: 'Janelas de Vidro',               parent: 'portas_janelas' },
  { key: 'fechaduras_ferragens',   label: 'Fechaduras e Ferragens',         parent: 'portas_janelas' },
  { key: 'portoes',                label: 'Portões',                        parent: 'portas_janelas' },
  { key: 'telas_grades',           label: 'Telas e Grades',                 parent: 'portas_janelas' },

  // ── Ferramentas → Nível 2 ────────────────────────────────────────────────
  { key: 'acessorios_ferramentas',  label: 'Acessórios Para Ferramentas',    parent: 'ferramentas' },
  { key: 'caixas_ferramentas',      label: 'Caixas de Ferramentas e Organ.', parent: 'ferramentas' },
  { key: 'escadas',                 label: 'Escadas',                        parent: 'ferramentas' },
  { key: 'ferramentas_eletricas',   label: 'Ferramentas Elétricas',          parent: 'ferramentas' },
  { key: 'ferramentas_manuais',     label: 'Ferramentas Manuais',            parent: 'ferramentas' },
  { key: 'ferramentas_construcao',  label: 'Ferramentas Para Construção',    parent: 'ferramentas' },
  { key: 'ferramentas_jardinagem',  label: 'Ferramentas Para Jardinagem',    parent: 'ferramentas' },
  { key: 'geradores',               label: 'Geradores',                      parent: 'ferramentas' },
  { key: 'instrumentos_medicao',    label: 'Instrumentos de Medição',        parent: 'ferramentas' },
];

export const getCategoryLabel = (key) => {
  const cat = CATEGORIES.find(c => c.key === key);
  return cat ? cat.label : key;
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
};
