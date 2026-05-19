import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Menu, ChevronDown, ChevronRight,
  MessageCircle, MapPin,
  BrickWall, Layers, Paintbrush2, Hammer, Droplets,
  Zap, Lightbulb, Bath, DoorOpen,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CATEGORIES } from '@/lib/categories';

const getChildren = (key) => CATEGORIES.filter(c => c.parent === key);
const getRoots    = ()    => CATEGORIES.filter(c => !c.parent);

const DEPT_ICONS = {
  materiais_construcao: BrickWall,
  pisos_revestimentos:  Layers,
  tintas_acessorios:    Paintbrush2,
  ferramentas:          Hammer,
  hidraulica:           Droplets,
  eletrica:             Zap,
  iluminacao:           Lightbulb,
  banheiro:             Bath,
  portas_janelas:       DoorOpen,
};

const BAR_KEYS = [
  'materiais_construcao',
  'pisos_revestimentos',
  'tintas_acessorios',
  'banheiro',
  'portas_janelas',
  'ferramentas',
];

// ── Painel individual da cascata ──────────────────────────────────────────────
function Panel({ items, activeKey, onHover, withIcons = false }) {
  return (
    <div
      className="flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto"
      style={{ width: withIcons ? 236 : 212, maxHeight: 460 }}
    >
      {items.map(item => {
        const Icon        = withIcons ? DEPT_ICONS[item.key] : null;
        const hasChildren = getChildren(item.key).length > 0;
        const isActive    = activeKey === item.key;

        return (
          <Link
            key={item.key}
            to={`/catalogo?categoria=${item.key}`}
            onMouseEnter={() => onHover(item.key)}
            className={`flex items-center gap-3 px-4 py-2.5 text-[13px] border-b border-gray-50 transition-colors ${
              isActive
                ? 'bg-primary/10 text-gray-900 font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {Icon && (
              <Icon
                className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-400'}`}
                strokeWidth={1.5}
              />
            )}
            <span className="flex-1 leading-snug">{item.label}</span>
            {hasChildren && (
              <ChevronRight
                className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-gray-500' : 'text-gray-300'}`}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}

// ── Controlador de cascata — suporta N níveis ─────────────────────────────────
// path[i] = key do item ativo no painel i
// Cada hover atualiza o nível correspondente e descarta os níveis abaixo
function CascadeDropdown({ renderTrigger, rootItems, withIcons = false }) {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState([]);

  const handleHover = (level, key) => {
    setPath(prev => [...prev.slice(0, level), key]);
  };

  // Constrói a lista de painéis dinamicamente a partir do path
  const panels = [];
  let levelItems = rootItems;
  for (let level = 0; ; level++) {
    const activeKey = path[level];
    panels.push({ items: levelItems, level, activeKey });
    if (!activeKey) break;
    const nextItems = getChildren(activeKey);
    if (nextItems.length === 0) break;
    levelItems = nextItems;
  }

  return (
    <div
      className="relative h-full flex-shrink-0 flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => { setOpen(false); setPath([]); }}
    >
      {renderTrigger({ open })}

      {open && (
        <div className="absolute top-full left-0 z-50 flex shadow-xl border-t-2 border-primary">
          {panels.map(({ items, level, activeKey }) => (
            <Panel
              key={level}
              items={items}
              activeKey={activeKey}
              onHover={(key) => handleHover(level, key)}
              withIcons={withIcons && level === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── "Todos os Departamentos" ──────────────────────────────────────────────────
function AllDepts() {
  return (
    <CascadeDropdown
      rootItems={getRoots()}
      withIcons={true}
      renderTrigger={({ open }) => (
        <button
          className={`flex items-center gap-2 h-full px-5 text-[12px] font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${
            open ? 'bg-primary text-gray-900' : 'bg-white/15 text-white hover:bg-white/20'
          }`}
        >
          <Menu className="h-4 w-4 flex-shrink-0" />
          Todos os Departamentos
          <ChevronDown className={`h-3 w-3 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      )}
    />
  );
}

// ── Aba de categoria da barra ─────────────────────────────────────────────────
function CategoryTab({ cat }) {
  const children = getChildren(cat.key);

  if (children.length === 0) {
    return (
      <Link
        to={`/catalogo?categoria=${cat.key}`}
        className="flex items-center gap-1 h-full px-4 text-[12px] font-semibold uppercase tracking-wide whitespace-nowrap text-white/90 hover:text-white hover:bg-white/10 transition-colors"
      >
        {cat.label}
      </Link>
    );
  }

  return (
    <CascadeDropdown
      rootItems={children}
      renderTrigger={({ open }) => (
        <Link
          to={`/catalogo?categoria=${cat.key}`}
          className={`flex items-center gap-1 h-full px-4 text-[12px] font-semibold uppercase tracking-wide whitespace-nowrap transition-colors ${
            open ? 'bg-white/15 text-white' : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}
        >
          {cat.label}
          <ChevronDown className={`h-3 w-3 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </Link>
      )}
    />
  );
}

// ── Menu mobile (acordeão) ────────────────────────────────────────────────────
function MobileMenu() {
  const [openKeys, setOpen] = useState({});
  const toggle = (key) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <nav className="divide-y divide-gray-100">
      {getRoots().map(root => {
        const Icon     = DEPT_ICONS[root.key];
        const children = getChildren(root.key);
        const rootOpen = openKeys[root.key];
        return (
          <div key={root.key}>
            <div className="flex items-center">
              <Link
                to={`/catalogo?categoria=${root.key}`}
                className="flex-1 flex items-center gap-3 py-3 px-4 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                {Icon && <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" strokeWidth={1.5} />}
                {root.label}
              </Link>
              {children.length > 0 && (
                <button onClick={() => toggle(root.key)} className="px-4 py-3 text-gray-400 hover:text-primary">
                  <ChevronDown className={`h-4 w-4 transition-transform ${rootOpen ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {rootOpen && (
              <div className="bg-gray-50 divide-y divide-gray-100">
                {children.map(child => {
                  const grandchildren = getChildren(child.key);
                  const childOpen     = openKeys[child.key];
                  return (
                    <div key={child.key}>
                      <div className="flex items-center pl-11">
                        <Link
                          to={`/catalogo?categoria=${child.key}`}
                          className="flex-1 py-2.5 text-sm text-gray-600 hover:text-primary transition-colors"
                        >
                          {child.label}
                        </Link>
                        {grandchildren.length > 0 && (
                          <button onClick={() => toggle(child.key)} className="px-4 py-2.5 text-gray-400 hover:text-primary">
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${childOpen ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>
                      {childOpen && (
                        <div className="bg-white pl-14 divide-y divide-gray-50">
                          {grandchildren.map(gc => (
                            <Link
                              key={gc.key}
                              to={`/catalogo?categoria=${gc.key}`}
                              className="block py-2 pr-4 text-xs text-gray-500 hover:text-primary transition-colors"
                            >
                              {gc.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ── Navbar principal ──────────────────────────────────────────────────────────
export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const barCats = CATEGORIES.filter(c => !c.parent && BAR_KEYS.includes(c.key));

  return (
    <header className="sticky top-0 z-50 shadow-md">

      {/* 1 ── Barra superior */}
      <div className="bg-gray-900 text-gray-400 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-center gap-4">
          <span className="text-yellow-400 font-semibold">✦ 5% de desconto no Pix</span>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <a
            href="https://wa.me/5538999144595"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-green-400 hover:text-green-300 font-medium transition-colors"
          >
            <MessageCircle className="h-3 w-3" /> (38) 99914-4595
          </a>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <a
            href="https://wa.me/5538999571663"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-green-400 hover:text-green-300 font-medium transition-colors"
          >
            <MessageCircle className="h-3 w-3" /> (38) 99957-1663
          </a>
        </div>
      </div>

      {/* 2 ── Logo + busca + ações */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">

            {/* Hamburger mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="lg:hidden flex items-center justify-center w-11 h-11 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors flex-shrink-0">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
                <div className="bg-gray-900 px-5 py-4">
                  <img
                    src="https://res.cloudinary.com/dqewxdbfx/image/upload/v1778761158/Design_sem_nome_8_zt8w8p.png"
                    alt="Lili Materiais"
                    className="h-9 w-auto brightness-0 invert"
                  />
                </div>
                <MobileMenu />
                <div className="p-4 border-t border-gray-100 space-y-3">
                  <a
                    href="https://wa.me/5538999144595"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-600 font-medium"
                  >
                    <MessageCircle className="h-4 w-4" /> (38) 99914-4595
                  </a>
                  <a
                    href="https://wa.me/5538999571663"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-600 font-medium"
                  >
                    <MessageCircle className="h-4 w-4" /> (38) 99957-1663
                  </a>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src="https://res.cloudinary.com/dqewxdbfx/image/upload/v1778761158/Design_sem_nome_8_zt8w8p.png"
                alt="Lili Materiais"
                className="h-11 w-auto object-contain"
              />
            </Link>

            {/* Busca desktop */}
            <form onSubmit={handleSearch} className="flex-1 hidden md:flex max-w-2xl mx-4">
              <div className="flex w-full rounded-full border-2 border-primary overflow-hidden shadow-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="O que você está buscando?"
                  className="flex-1 px-5 py-2.5 text-sm text-gray-700 bg-white outline-none placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 font-bold px-5 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden lg:inline text-sm">Buscar</span>
                </button>
              </div>
            </form>

            {/* Ações direita */}
            <div className="flex items-center gap-3 ml-auto">
              <Link
                to="/lojas"
                className="hidden md:flex items-center gap-2.5 text-sm text-gray-700 hover:text-primary font-semibold transition-colors"
              >
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="hidden lg:block leading-tight">
                  <p className="text-[10px] text-gray-400 font-normal">Encontre a</p>
                  <p className="text-[12px]">Nossas Lojas</p>
                </div>
              </Link>

              <a
                href="https://wa.me/5538999144595"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2.5 text-sm text-green-600 hover:text-green-700 font-semibold transition-colors"
              >
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="hidden lg:block leading-tight">
                  <p className="text-[10px] text-gray-400 font-normal">Fale conosco</p>
                  <p className="text-[12px]">WhatsApp</p>
                </div>
              </a>

            </div>
          </div>

          {/* Busca mobile */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}>
              <div className="flex w-full rounded-full border-2 border-primary overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="flex-1 px-4 py-3 text-sm text-gray-700 bg-white outline-none placeholder:text-gray-400 min-h-[44px]"
                />
                <button type="submit" className="bg-primary px-5 text-gray-900 flex items-center justify-center min-w-[52px]">
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 3 ── Barra de categorias desktop */}
      <nav className="hidden lg:block bg-gray-800 h-11">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-stretch">

          <AllDepts />

          <div className="flex items-stretch flex-1">
            {barCats.map(cat => (
              <CategoryTab key={cat.key} cat={cat} />
            ))}
          </div>

        </div>
      </nav>

    </header>
  );
}
