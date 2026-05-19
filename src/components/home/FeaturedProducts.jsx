import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import ProductCard from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, ChevronRight } from 'lucide-react';

export default function FeaturedProducts() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.entities.Product.filter({ promocao: true }, { column: 'created_at', order: 'desc' }, 8),
  });

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-500 flex-shrink-0" />
              <h2 className="font-heading font-extrabold text-xl uppercase tracking-tight text-gray-900">
                Ofertas em Destaque
              </h2>
            </div>
            <div className="mt-1 h-0.5 w-10 bg-primary rounded-full ml-7" />
          </div>
          <Link
            to="/catalogo"
            className="flex items-center gap-0.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Ver todos <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3 bg-white p-3 rounded-sm">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
