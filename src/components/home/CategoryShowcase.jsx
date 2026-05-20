import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';

const categories = CATEGORIES.filter(category => !category.parent && category.image);

export default function CategoryShowcase() {
  return (
    <section className="py-6 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-extrabold text-base uppercase tracking-tight text-gray-900">
              Departamentos
            </h2>
            <div className="mt-1 h-0.5 w-8 bg-primary rounded-full" />
          </div>
          <Link
            to="/catalogo"
            className="flex items-center gap-0.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Ver todos <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-9 lg:overflow-visible scrollbar-hide">
          {categories.map(({ key, label, image }) => (
            <Link
              key={key}
              to={`/catalogo?categoria=${key}`}
              className="flex flex-col items-center gap-2 group flex-shrink-0 w-[76px] lg:w-auto"
            >
              <div className="w-[68px] h-[68px] lg:w-full lg:aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md group-hover:border-primary/30 flex-shrink-0">
                <img
                  src={image}
                  alt={label}
                  className="w-full h-full object-contain p-1.5"
                />
              </div>
              <span className="text-[11px] font-medium text-gray-600 text-center leading-tight line-clamp-2 group-hover:text-primary transition-colors w-full">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
