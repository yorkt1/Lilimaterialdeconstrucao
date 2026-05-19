import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatPrice } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash2, Minus, Plus, ChevronRight, ShoppingCart, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => user ? api.entities.CartItem.filter({ user_id: user.id }) : [],
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.CartItem.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.CartItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Produto removido');
    },
  });

  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const total = subtotal;

  const handleCheckout = () => {
    const itemsList = items.map(item => `- ${item.quantity}x ${item.product_name} (${formatPrice(item.price * item.quantity)})`).join('\n');
    const message = `Olá! Gostaria de fazer um pedido:\n\n${itemsList}\n\n*Total: ${formatPrice(total)}*`;
    const whatsappUrl = `https://wa.me/5538999144595?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isLoading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
        <h2 className="font-heading font-extrabold text-2xl uppercase tracking-tight">Seu carrinho está vazio</h2>
        <p className="text-sm text-muted-foreground mt-2">Encontre os melhores materiais para sua obra</p>
        <Link to="/catalogo">
          <Button className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground font-heading text-xs uppercase tracking-wider px-8 h-12 rounded-none">
            Explorar Catálogo
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
        <Link to="/" className="hover:text-accent transition-colors">Início</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">Carrinho</span>
      </nav>

      <h1 className="font-heading font-extrabold text-2xl md:text-3xl uppercase tracking-tight mb-8">
        Seu Carrinho
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-8 lg:gap-12">
        {/* Items */}
        <div className="space-y-0 divide-y divide-border">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 py-6 first:pt-0">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-muted flex-shrink-0 overflow-hidden">
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/produto/${item.product_id}`} className="font-heading font-bold text-sm uppercase tracking-wider hover:text-accent transition-colors line-clamp-2">
                  {item.product_name}
                </Link>
                <p className="font-heading font-bold text-base mt-2">{formatPrice(item.price)}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => updateMutation.mutate({ id: item.id, data: { quantity: Math.max(1, (item.quantity || 1) - 1) } })}
                      className="h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="h-8 w-10 flex items-center justify-center text-sm font-heading font-bold border-x border-border">
                      {item.quantity || 1}
                    </span>
                    <button
                      onClick={() => updateMutation.mutate({ id: item.id, data: { quantity: (item.quantity || 1) + 1 } })}
                      className="h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="hidden md:block text-right">
                <p className="font-heading font-bold text-base">{formatPrice(item.price * (item.quantity || 1))}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-36 lg:self-start">
          <div className="bg-card border border-border p-6 space-y-4">
            <h2 className="font-heading font-bold text-sm uppercase tracking-wider">Resumo do Pedido</h2>
            <Separator />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({items.length} itens)</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-baseline">
              <span className="font-heading font-bold text-sm uppercase tracking-wider">Total</span>
              <span className="font-heading font-extrabold text-2xl">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground">O pedido será finalizado via WhatsApp</p>
            <Button
              onClick={handleCheckout}
              className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground font-heading text-sm uppercase tracking-wider rounded-none mt-4"
            >
              Finalizar no WhatsApp
            </Button>
            <Link to="/catalogo" className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors pt-2">
              <ArrowLeft className="h-3 w-3" />
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}