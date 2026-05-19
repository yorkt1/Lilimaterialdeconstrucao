import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPrice, getCategoryLabel, CATEGORIES } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Tag, CheckCircle, XCircle, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import ProductFormModal from '@/components/admin/ProductFormModal';

export default function AdminProducts() {
  const [search, setSearch]           = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState(null);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.entities.Product.list({ column: 'created_at', order: 'desc' }, 200),
  });

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || p.nome?.toLowerCase().includes(search.toLowerCase());
      const matchCat    = categoryFilter === 'all' || p.categoria === categoryFilter;
      const matchStock  =
        stockFilter === 'all'      ? true :
        stockFilter === 'low'      ? p.estoque > 0 && p.estoque <= 5 :
        stockFilter === 'out'      ? p.estoque === 0 :
        true;
      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Excluir este produto?')) return;
    await api.entities.Product.delete(id);
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    toast.success('Produto excluído');
  };

  const handleTogglePromocao = async (product) => {
    await api.entities.Product.update(product.id, { promocao: !product.promocao });
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    toast.success(product.promocao ? 'Removido das promoções' : 'Adicionado às promoções');
  };

  const handleToggleAtivo = async (product) => {
    await api.entities.Product.update(product.id, { ativo: !product.ativo });
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} produto(s) encontrado(s)</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full pl-10 pr-4 h-10 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="h-10 px-3 border border-gray-200 bg-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition min-w-52"
        >
          <option value="all">Todas as categorias</option>
          {CATEGORIES.filter(c => !c.parent).map(root => {
            const children = CATEGORIES.filter(c => c.parent === root.key);
            return (
              <optgroup key={root.key} label={root.label}>
                <option value={root.key}>{root.label} (geral)</option>
                {children.map(child => {
                  const grandchildren = CATEGORIES.filter(c => c.parent === child.key);
                  return (
                    <React.Fragment key={child.key}>
                      <option value={child.key}>{child.label}</option>
                      {grandchildren.map(gc => (
                        <option key={gc.key} value={gc.key}>{'  ↳ '}{gc.label}</option>
                      ))}
                    </React.Fragment>
                  );
                })}
              </optgroup>
            );
          })}
        </select>
        <select
          value={stockFilter}
          onChange={e => setStockFilter(e.target.value)}
          className="h-10 px-3 border border-gray-200 bg-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition min-w-44"
        >
          <option value="all">Todo estoque</option>
          <option value="low">Estoque baixo (≤ 5)</option>
          <option value="out">Esgotado (0)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Produto</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Preço</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Estoque</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Status</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-8 bg-gray-100 animate-pulse rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-400 text-sm">
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {product.imagem
                          ? <img src={product.imagem} alt={product.nome} className="w-full h-full object-cover" />
                          : <ImageOff className="h-4 w-4 m-3 text-gray-300" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.nome}</p>
                        {product.marca && <p className="text-xs text-gray-400 truncate max-w-[200px]">{product.marca}</p>}
                        {product.promocao && (
                          <span className="inline-block text-[9px] font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded mt-0.5">PROMOÇÃO</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-gray-500">{getCategoryLabel(product.categoria)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-bold text-gray-900">
                        {formatPrice(product.preco_promocional && product.preco_promocional < product.preco
                          ? product.preco_promocional
                          : product.preco)}
                      </p>
                      {product.preco_promocional && product.preco_promocional < product.preco && (
                        <p className="text-xs text-gray-400 line-through">{formatPrice(product.preco)}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-sm font-medium ${
                      product.estoque === 0 ? 'text-red-500' :
                      product.estoque <= 3 ? 'text-orange-500' :
                      'text-gray-700'
                    }`}>
                      {product.estoque ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <button
                      onClick={() => handleToggleAtivo(product)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                        product.ativo
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {product.ativo
                        ? <><CheckCircle className="h-3 w-3" /> Ativo</>
                        : <><XCircle className="h-3 w-3" /> Inativo</>
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title={product.promocao ? 'Remover promoção' : 'Marcar promoção'}
                        onClick={() => handleTogglePromocao(product)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          product.promocao
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                        }`}
                      >
                        <Tag className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => { setEditing(product); setModalOpen(true); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        product={editing}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-products'] });
          setModalOpen(false);
          setEditing(null);
        }}
      />
    </div>
  );
}
