import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CATEGORIES, formatPrice } from '@/lib/categories';
import { X, ChevronDown } from 'lucide-react';

const getRoots    = ()    => CATEGORIES.filter(c => !c.parent);
const getChildren = (key) => CATEGORIES.filter(c => c.parent === key);

// ── Acordeão hierárquico de categorias ───────────────────────────────────────
function CategoryAccordion({ selected, onToggle, counts = {} }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-0.5">
      {getRoots().map(root => {
        const children   = getChildren(root.key);
        const isExpanded = !!expanded[root.key];
        const isChecked  = selected.includes(root.key);
        const count      = counts[root.key] || 0;

        return (
          <div key={root.key}>
            <div className="flex items-center gap-2 py-1.5">
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => onToggle(root.key)}
                className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0"
              />
              <span
                onClick={() => onToggle(root.key)}
                className={`flex-1 text-sm cursor-pointer select-none leading-tight ${isChecked ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
              >
                {root.label}
              </span>
              {count > 0 && (
                <span className="text-[11px] text-gray-400 tabular-nums flex-shrink-0">{count}</span>
              )}
              {children.length > 0 && (
                <button
                  onClick={() => toggle(root.key)}
                  className="text-gray-400 hover:text-gray-600 p-0.5 flex-shrink-0"
                >
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {isExpanded && children.length > 0 && (
              <div className="ml-5 mb-1 pl-3 border-l border-gray-100 space-y-0.5">
                {children.map(child => {
                  const childCount   = counts[child.key] || 0;
                  const childChecked = selected.includes(child.key);
                  return (
                    <label key={child.key} className="flex items-center gap-2 py-1 cursor-pointer group">
                      <Checkbox
                        checked={childChecked}
                        onCheckedChange={() => onToggle(child.key)}
                        className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3.5 w-3.5 flex-shrink-0"
                      />
                      <span className={`flex-1 text-[13px] leading-tight group-hover:text-primary transition-colors ${childChecked ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {child.label}
                      </span>
                      {childCount > 0 && (
                        <span className="text-[11px] text-gray-400 tabular-nums flex-shrink-0">{childCount}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ProductFilters({ filters, onFilterChange, onClose, brands = [], sliderMax = 10000, categoryCounts = {} }) {
  const handleCategoryToggle = (key) => {
    const cur     = filters.categories || [];
    const updated = cur.includes(key) ? cur.filter(c => c !== key) : [...cur, key];
    onFilterChange({ ...filters, categories: updated });
  };

  const handleMarcaToggle = (marca) => {
    const cur     = filters.marcas || [];
    const updated = cur.includes(marca) ? cur.filter(m => m !== marca) : [...cur, marca];
    onFilterChange({ ...filters, marcas: updated });
  };

  const clearAll = () =>
    onFilterChange({ categories: [], marcas: [], minPrice: 0, maxPrice: null, emPromocao: false, emEstoque: false });

  const hasActive =
    (filters.categories || []).length > 0 ||
    (filters.marcas || []).length > 0 ||
    filters.emPromocao ||
    filters.emEstoque ||
    filters.minPrice > 0 ||
    filters.maxPrice !== null;

  const sliderValue = [filters.minPrice || 0, filters.maxPrice ?? sliderMax];

  return (
    <div className="space-y-6">

      {/* Header mobile */}
      <div className="flex items-center justify-between lg:hidden">
        <h2 className="font-heading font-bold text-sm uppercase tracking-wider">Filtros</h2>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>

      {hasActive && (
        <button onClick={clearAll} className="text-xs text-red-500 hover:underline font-medium">
          Limpar todos os filtros
        </button>
      )}

      {/* Categoria */}
      <div>
        <h3 className="font-heading font-bold text-[11px] uppercase tracking-[0.2em] mb-3 text-muted-foreground">
          Categoria
        </h3>
        <CategoryAccordion selected={filters.categories || []} onToggle={handleCategoryToggle} counts={categoryCounts} />
      </div>

      <Separator />

      {/* Marca */}
      {brands.length > 0 && (
        <>
          <div>
            <h3 className="font-heading font-bold text-[11px] uppercase tracking-[0.2em] mb-3 text-muted-foreground">
              Marca
            </h3>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
              {brands.map(marca => (
                <label key={marca} className="flex items-center gap-2.5 cursor-pointer group">
                  <Checkbox
                    checked={(filters.marcas || []).includes(marca)}
                    onCheckedChange={() => handleMarcaToggle(marca)}
                    className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0"
                  />
                  <span className={`text-sm group-hover:text-primary transition-colors ${(filters.marcas || []).includes(marca) ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                    {marca}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Disponibilidade */}
      <div>
        <h3 className="font-heading font-bold text-[11px] uppercase tracking-[0.2em] mb-3 text-muted-foreground">
          Disponibilidade
        </h3>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <Checkbox
              checked={!!filters.emEstoque}
              onCheckedChange={v => onFilterChange({ ...filters, emEstoque: !!v })}
              className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">Em estoque</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <Checkbox
              checked={!!filters.emPromocao}
              onCheckedChange={v => onFilterChange({ ...filters, emPromocao: !!v })}
              className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">Em promoção</span>
          </label>
        </div>
      </div>

      <Separator />

      {/* Faixa de preço */}
      <div>
        <h3 className="font-heading font-bold text-[11px] uppercase tracking-[0.2em] mb-4 text-muted-foreground">
          Faixa de Preço
        </h3>
        <Slider
          min={0}
          max={sliderMax}
          step={50}
          value={sliderValue}
          onValueChange={([min, max]) =>
            onFilterChange({ ...filters, minPrice: min, maxPrice: max >= sliderMax ? null : max })
          }
          className="mt-2"
        />
        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
          <span>{formatPrice(filters.minPrice || 0)}</span>
          <span>{filters.maxPrice === null ? 'Sem limite' : formatPrice(filters.maxPrice)}</span>
        </div>
      </div>
    </div>
  );
}
