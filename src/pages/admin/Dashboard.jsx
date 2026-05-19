import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Package, Tag, TrendingUp, AlertTriangle, XCircle, BarChart2 } from 'lucide-react';
import { formatPrice, getCategoryLabel } from '@/lib/categories';

function StatCard({ icon: Icon, label, value, sub, iconBg, iconColor, border }) {
  return (
    <div className={`bg-white rounded-xl border-l-4 ${border} shadow-sm p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
        <p className="font-bold text-2xl text-gray-900 mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.entities.Product.list(),
  });

  const totalProducts = products.length;
  const onPromo      = products.filter(p => p.promocao).length;
  const inactive     = products.filter(p => !p.ativo).length;
  const lowStock     = products.filter(p => p.estoque !== null && p.estoque !== undefined && p.estoque <= 3).length;

  const categoryCount = products.reduce((acc, p) => {
    if (p.categoria) acc[p.categoria] = (acc[p.categoria] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral da sua loja</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package} label="Total de Produtos" value={totalProducts} sub="cadastrados"
          iconBg="bg-blue-50" iconColor="text-blue-600" border="border-blue-500"
        />
        <StatCard
          icon={Tag} label="Em Promoção" value={onPromo} sub="produtos"
          iconBg="bg-yellow-50" iconColor="text-yellow-600" border="border-yellow-500"
        />
        <StatCard
          icon={AlertTriangle} label="Estoque Baixo" value={lowStock} sub="≤ 3 unidades"
          iconBg="bg-orange-50" iconColor="text-orange-600" border="border-orange-500"
        />
        <StatCard
          icon={XCircle} label="Inativos" value={inactive} sub="produtos"
          iconBg="bg-red-50" iconColor="text-red-600" border="border-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wider">Produtos por Categoria</h2>
          </div>
          <div className="space-y-4">
            {topCategories.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Nenhum produto cadastrado</p>
            ) : topCategories.map(([cat, count]) => (
              <div key={cat} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{getCategoryLabel(cat)}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(count / totalProducts) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wider">Últimos Cadastrados</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProducts.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Nenhum produto cadastrado</p>
            ) : recentProducts.map(p => (
              <div key={p.id} className="flex items-center gap-3 py-2.5">
                <div className="w-11 h-11 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {p.imagem
                    ? <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover" />
                    : <Package className="h-4 w-4 m-3.5 text-gray-300" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.nome}</p>
                  <p className="text-xs text-gray-400">{p.marca || getCategoryLabel(p.categoria) || '—'}</p>
                </div>
                <span className="text-sm font-bold text-gray-900 flex-shrink-0">{formatPrice(p.preco)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
