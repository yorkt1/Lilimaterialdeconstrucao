import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/categories';
import { ShoppingBag, Trash2, Search, ImageOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-cart-all'],
    queryFn: () => api.entities.CartItem.list({ column: 'created_at', order: 'desc' }, 200),
  });

  const handleDelete = async (id) => {
    if (!confirm('Remover este item?')) return;
    await api.entities.CartItem.delete(id);
    queryClient.invalidateQueries({ queryKey: ['admin-cart-all'] });
    toast.success('Item removido');
  };

  const filtered = items.filter(i =>
    !search ||
    i.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.created_by?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by user
  const grouped = filtered.reduce((acc, item) => {
    const key = item.created_by || 'Anônimo';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const totalRevenue = items.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-2xl uppercase tracking-tight">Pedidos / Carrinhos</h1>
          <p className="text-sm text-muted-foreground mt-1">Itens em carrinho dos usuários</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5">
          <p className="text-[11px] font-heading uppercase tracking-wider text-muted-foreground">Itens em Carrinho</p>
          <p className="font-heading font-extrabold text-3xl mt-2">{items.length}</p>
        </div>
        <div className="bg-card border border-border p-5">
          <p className="text-[11px] font-heading uppercase tracking-wider text-muted-foreground">Usuários Ativos</p>
          <p className="font-heading font-extrabold text-3xl mt-2">{Object.keys(grouped).length}</p>
        </div>
        <div className="bg-card border border-border p-5">
          <p className="text-[11px] font-heading uppercase tracking-wider text-muted-foreground">Valor Total</p>
          <p className="font-heading font-extrabold text-2xl mt-2 text-accent">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por produto ou usuário..."
          className="pl-10 h-10"
        />
      </div>

      {/* Grouped by user */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse" />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-card border border-border p-16 text-center">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-sm text-muted-foreground">Nenhum item em carrinho</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([user, userItems]) => {
            const subtotal = userItems.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);
            return (
              <div key={user} className="bg-card border border-border">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/50">
                  <div>
                    <p className="font-heading font-bold text-sm uppercase tracking-wider">{user}</p>
                    <p className="text-xs text-muted-foreground">{userItems.length} item(s)</p>
                  </div>
                  <p className="font-heading font-bold text-accent">{formatPrice(subtotal)}</p>
                </div>
                <div className="divide-y divide-border">
                  {userItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="w-12 h-12 bg-muted flex-shrink-0 overflow-hidden">
                        {item.product_image
                          ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                          : <ImageOff className="h-4 w-4 m-4 text-muted-foreground/20" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity || 1}x {formatPrice(item.price)} = <span className="font-medium text-foreground">{formatPrice(item.price * (item.quantity || 1))}</span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}