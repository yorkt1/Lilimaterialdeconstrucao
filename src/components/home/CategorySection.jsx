import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/categories';
import ProductCard from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';

function inCategory(productCat, filterCat) {
  if (!productCat || !filterCat) return false;
  if (productCat === filterCat) return true;
  const cat = CATEGORIES.find(c => c.key === productCat);
  return cat?.parent ? inCategory(cat.parent, filterCat) : false;
}

const SECTIONS = [
  { key: 'ferramentas',         title: 'Ferramentas' },
  { key: 'hidraulica',          title: 'Hidráulica' },
  { key: 'banheiro',            title: 'Banheiro' },
  { key: 'materiais_construcao', title: 'Materiais de Construção' },
];

function SectionSkeleton() {
  return (
    <section className="py-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 bg-white border border-gray-100 p-3 rounded-sm">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Section({ sectionKey, title, allProducts, odd }) {
  const products = useMemo(() => {
    return allProducts
      .filter(p => p.ativo !== false && inCategory(p.categoria, sectionKey))
      .slice(0, 4);
  }, [allProducts, sectionKey]);

  if (products.length === 0) return null;

  return (
    <section className={`py-10 border-t border-gray-100 ${odd ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-extrabold text-xl uppercase tracking-tight text-gray-900">
              {title}
            </h2>
            <div className="mt-1 h-0.5 w-10 bg-primary rounded-full" />
          </div>
          <Link
            to={`/catalogo?categoria=${sectionKey}`}
            className="flex items-center gap-0.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Ver todos <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CategorySections() {
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.entities.Product.list({ column: 'created_at', order: 'desc' }, 500),
  });

  if (isLoading) {
    return <>{SECTIONS.map(s => <SectionSkeleton key={s.key} />)}</>;
  }

  return (
    <>
      {SECTIONS.map((s, i) => (
        <Section key={s.key} sectionKey={s.key} title={s.title} allProducts={allProducts} odd={i % 2 !== 0} />
      ))}
    </>
  );
}
