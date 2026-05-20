import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal, Grid3X3, LayoutGrid, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CATEGORIES, getCategoryLabel, formatPrice } from '@/lib/categories';

const PER_PAGE = 24;

// ── Helpers de URL ────────────────────────────────────────────────────────────
function filtersFromParams(params) {
  return {
    categories: params.getAll('categoria'),
    marcas:     params.getAll('marca'),
    minPrice:   parseInt(params.get('minPreco') || '0') || 0,
    maxPrice:   params.get('maxPreco') ? parseInt(params.get('maxPreco')) : null,
    emPromocao: params.get('promocao') === '1',
    emEstoque:  params.get('estoque') === '1',
  };
}

function buildParams(filters, sortBy, searchQuery, page) {
  const p = new URLSearchParams();
  if (searchQuery)      p.set('q', searchQuery);
  filters.categories.forEach(c => p.append('categoria', c));
  filters.marcas.forEach(m     => p.append('marca', m));
  if (filters.minPrice > 0)    p.set('minPreco', String(filters.minPrice));
  if (filters.maxPrice !== null) p.set('maxPreco', String(filters.maxPrice));
  if (filters.emPromocao)      p.set('promocao', '1');
  if (filters.emEstoque)       p.set('estoque', '1');
  if (sortBy && sortBy !== 'relevance') p.set('ordem', sortBy);
  if (page > 1)                p.set('pagina', String(page));
  return p;
}

// Retorna true se productCat é igual ou descendente de filterCat
function inCategory(productCat, filterCat) {
  if (!productCat || !filterCat) return false;
  if (productCat === filterCat) return true;
  const cat = CATEGORIES.find(c => c.key === productCat);
  return cat?.parent ? inCategory(cat.parent, filterCat) : false;
}

// ── Chip de filtro ativo ──────────────────────────────────────────────────────
function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-gray-800 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
      {label}
      <button onClick={onRemove} className="hover:text-red-500 transition-colors flex-shrink-0">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// ── Paginação ─────────────────────────────────────────────────────────────────
function Paginacao({ page, total, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const items = [1];
  if (page > 3) items.push('…');
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) items.push(i);
  if (page < totalPages - 2) items.push('…');
  if (totalPages > 1) items.push(totalPages);

  const btn = 'h-9 min-w-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors px-1';

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onChange(page - 1)} disabled={page === 1}
        className={`${btn} border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {items.map((item, i) =>
        item === '…'
          ? <span key={`d${i}`} className="text-gray-400 px-1 text-sm">…</span>
          : <button
              key={item}
              onClick={() => onChange(item)}
              className={`${btn} ${page === item ? 'bg-primary text-gray-900 font-bold border border-primary' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
            >{item}</button>
      )}
      <button
        onClick={() => onChange(page + 1)} disabled={page === totalPages}
        className={`${btn} border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL é a fonte da verdade para filtros, ordenação e página
  const filters     = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const sortBy      = searchParams.get('ordem') || 'relevance';
  const searchQuery = searchParams.get('q') || '';
  const page        = parseInt(searchParams.get('pagina') || '1') || 1;

  const [gridCols, setGridCols]                 = useState(4);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Quando filtros mudam, volta para página 1
  const setFilters = useCallback((newFilters) => {
    setSearchParams(buildParams(newFilters, sortBy, searchQuery, 1), { replace: true });
  }, [sortBy, searchQuery, setSearchParams]);

  const setSortBy = useCallback((newSort) => {
    setSearchParams(buildParams(filters, newSort, searchQuery, 1), { replace: true });
  }, [filters, searchQuery, setSearchParams]);

  const setPage = useCallback((newPage) => {
    setSearchParams(buildParams(filters, sortBy, searchQuery, newPage), { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, sortBy, searchQuery, setSearchParams]);

  const clearAllFilters = useCallback(() => {
    setSearchParams(buildParams(
      { categories: [], marcas: [], minPrice: 0, maxPrice: null, emPromocao: false, emEstoque: false },
      'relevance', searchQuery, 1
    ), { replace: true });
  }, [searchQuery, setSearchParams]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn:  () => api.entities.Product.list({ column: 'created_at', order: 'desc' }, 500),
  });

  const brands = useMemo(
    () => [...new Set(products.map(p => p.marca).filter(Boolean))].sort(),
    [products]
  );

  const sliderMax = useMemo(() => {
    const prices = products
      .map(p => p.preco_promocional && p.preco_promocional < p.preco ? p.preco_promocional : p.preco)
      .filter(Boolean);
    return prices.length > 0 ? Math.ceil(Math.max(...prices) / 100) * 100 : 10000;
  }, [products]);

  const getPreco = (p) =>
    p.preco_promocional && p.preco_promocional < p.preco ? p.preco_promocional : p.preco;

  // Produtos base para calcular contagens (aplica tudo exceto categorias)
  const baseForCounts = useMemo(() => {
    let r = products.filter(p => p.ativo !== false);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter(p => p.nome?.toLowerCase().includes(q) || p.descricao?.toLowerCase().includes(q) || p.marca?.toLowerCase().includes(q));
    }
    if (filters.marcas.length > 0)  r = r.filter(p => filters.marcas.includes(p.marca));
    if (filters.emPromocao)          r = r.filter(p => p.promocao || (p.preco_promocional && p.preco_promocional < p.preco));
    if (filters.emEstoque)           r = r.filter(p => p.estoque == null || p.estoque > 0);
    r = r.filter(p => {
      const pr = getPreco(p);
      if (pr == null) return true;
      if (pr < filters.minPrice) return false;
      if (filters.maxPrice !== null && pr > filters.maxPrice) return false;
      return true;
    });
    return r;
  }, [products, searchQuery, filters.marcas, filters.emPromocao, filters.emEstoque, filters.minPrice, filters.maxPrice]);

  // Contagem por categoria (inclui ancestrais)
  const categoryCounts = useMemo(() => {
    const map = {};
    baseForCounts.forEach(p => {
      if (!p.categoria) return;
      let key = p.categoria;
      while (key) {
        map[key] = (map[key] || 0) + 1;
        const cat = CATEGORIES.find(c => c.key === key);
        key = cat?.parent || null;
      }
    });
    return map;
  }, [baseForCounts]);

  // Produtos filtrados
  const filteredProducts = useMemo(() => {
    let r = [...baseForCounts];

    if (filters.categories.length > 0) {
      r = r.filter(p => filters.categories.some(cat => inCategory(p.categoria, cat)));
    }

    switch (sortBy) {
      case 'price_asc':  r.sort((a, b) => (getPreco(a) ?? Infinity) - (getPreco(b) ?? Infinity)); break;
      case 'price_desc': r.sort((a, b) => (getPreco(b) ?? -Infinity) - (getPreco(a) ?? -Infinity)); break;
      case 'name':       r.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')); break;
    }

    return r;
  }, [baseForCounts, filters.categories, sortBy]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredProducts.slice(start, start + PER_PAGE);
  }, [filteredProducts, page]);

  // Chips de filtros ativos
  const chips = [
    ...filters.categories.map(key => ({
      label:    getCategoryLabel(key),
      onRemove: () => setFilters({ ...filters, categories: filters.categories.filter(c => c !== key) }),
    })),
    ...filters.marcas.map(m => ({
      label:    m,
      onRemove: () => setFilters({ ...filters, marcas: filters.marcas.filter(x => x !== m) }),
    })),
    ...(filters.emPromocao ? [{ label: 'Em promoção', onRemove: () => setFilters({ ...filters, emPromocao: false }) }] : []),
    ...(filters.emEstoque  ? [{ label: 'Em estoque',  onRemove: () => setFilters({ ...filters, emEstoque: false })  }] : []),
    ...(filters.minPrice > 0 || filters.maxPrice !== null ? [{
      label:    `${formatPrice(filters.minPrice)} – ${filters.maxPrice === null ? 'sem limite' : formatPrice(filters.maxPrice)}`,
      onRemove: () => setFilters({ ...filters, minPrice: 0, maxPrice: null }),
    }] : []),
  ];

  const pageTitle = searchQuery
    ? `Resultados para "${searchQuery}"`
    : filters.categories.length === 1
      ? getCategoryLabel(filters.categories[0])
      : 'Todos os Produtos';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link to="/" className="hover:text-accent transition-colors">Início</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{pageTitle}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl uppercase tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            {filteredProducts.length > PER_PAGE && ` — página ${page} de ${Math.ceil(filteredProducts.length / PER_PAGE)}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden text-xs font-heading uppercase tracking-wider">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
                Filtros {chips.length > 0 && `(${chips.length})`}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-6 overflow-y-auto">
              <ProductFilters
                filters={filters}
                onFilterChange={setFilters}
                onClose={() => setMobileFiltersOpen(false)}
                brands={brands}
                sliderMax={sliderMax}
                categoryCounts={categoryCounts}
              />
            </SheetContent>
          </Sheet>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44 h-9 text-xs font-heading uppercase tracking-wider">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevância</SelectItem>
              <SelectItem value="price_asc">Menor Preço</SelectItem>
              <SelectItem value="price_desc">Maior Preço</SelectItem>
              <SelectItem value="name">Nome A-Z</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden md:flex gap-1">
            <Button variant={gridCols === 3 ? 'default' : 'ghost'} size="icon" className="h-9 w-9" onClick={() => setGridCols(3)}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={gridCols === 4 ? 'default' : 'ghost'} size="icon" className="h-9 w-9" onClick={() => setGridCols(4)}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chips de filtros ativos */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          {chips.map((chip, i) => (
            <FilterChip key={i} label={chip.label} onRemove={chip.onRemove} />
          ))}
          <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors ml-1">
            Limpar tudo
          </button>
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-36">
            <ProductFilters
              filters={filters}
              onFilterChange={setFilters}
              onClose={() => {}}
              brands={brands}
              sliderMax={sliderMax}
              categoryCounts={categoryCounts}
            />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-heading font-bold text-lg uppercase tracking-wider">Nenhum produto encontrado</p>
              <p className="text-sm text-muted-foreground mt-2">Tente ajustar os filtros ou buscar por outro termo.</p>
              <Button variant="outline" className="mt-6 font-heading text-xs uppercase tracking-wider" onClick={clearAllFilters}>
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-2 gap-4 md:gap-5 ${gridCols === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4'}`}>
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Paginacao page={page} total={filteredProducts.length} perPage={PER_PAGE} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
