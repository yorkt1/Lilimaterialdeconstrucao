import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPrice, getCategoryLabel, CATEGORIES } from '@/lib/categories';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, ChevronRight, Truck, ShieldCheck, MessageCircle, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import ProductCard from '@/components/products/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const results = await api.entities.Product.filter({ id });
      return results?.[0] ?? null;
    },
  });

  const relatedCat = product?.categoria
    ? (CATEGORIES.find(c => c.key === product.categoria)?.parent ?? product.categoria)
    : null;

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['related', relatedCat],
    queryFn: async () => {
      const catKeys = [relatedCat, ...CATEGORIES.filter(c => c.parent === relatedCat).map(c => c.key)];
      const all = await api.entities.Product.list({ column: 'created_at', order: 'desc' }, 50);
      return all.filter(p => catKeys.includes(p.categoria));
    },
    enabled: !!relatedCat,
  });

  const handleWhatsApp = () => {
    const msg = `Olá! Gostaria de comprar: ${product.nome} — ${formatPrice(precoFinal)}`;
    window.open(`https://wa.me/5538999144595?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="font-heading font-bold text-xl uppercase">Produto não encontrado</h2>
        <Link to="/catalogo" className="text-accent text-sm mt-4 inline-block">← Voltar ao catálogo</Link>
      </div>
    );
  }

  const semPreco = product.preco == null;
  const precoFinal = !semPreco && product.preco_promocional && product.preco_promocional < product.preco
    ? product.preco_promocional
    : product.preco;

  const discount = !semPreco && product.preco_promocional && product.preco_promocional < product.preco
    ? Math.round((1 - product.preco_promocional / product.preco) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
        <Link to="/" className="hover:text-accent transition-colors">Início</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/catalogo" className="hover:text-accent transition-colors">Catálogo</Link>
        <ChevronRight className="h-3 w-3" />
        {product.categoria && (
          <>
            <Link to={`/catalogo?categoria=${product.categoria}`} className="hover:text-accent transition-colors">
              {getCategoryLabel(product.categoria)}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-foreground font-medium truncate max-w-48">{product.nome}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-8 lg:gap-12">
        <div className="relative aspect-square bg-gray-50 border border-gray-100 overflow-hidden">
          {discount > 0 && (
            <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-heading font-bold uppercase tracking-wider px-3 py-1.5">
              -{discount}%
            </div>
          )}
          {product.imagem ? (
            <img src={product.imagem} alt={product.nome} className="w-full h-full object-contain p-6" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-24 w-24 opacity-10" />
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-36 lg:self-start space-y-6">
          <h1 className="font-heading font-extrabold text-xl md:text-2xl uppercase tracking-tight leading-tight">
            {product.nome}
          </h1>

          {semPreco ? (
            <div className="space-y-1">
              <p className="font-heading font-extrabold text-2xl text-primary">Consulte-nos</p>
              <p className="text-sm text-muted-foreground">Preço sob consulta — entre em contato</p>
            </div>
          ) : (
            <div className="space-y-1">
              {product.preco_promocional && product.preco_promocional < product.preco && (
                <p className="text-sm text-muted-foreground line-through">{formatPrice(product.preco)}</p>
              )}
              <p className="font-heading font-extrabold text-3xl">{formatPrice(precoFinal)}</p>
              <p className="text-sm text-muted-foreground">ou 10x de {formatPrice(precoFinal / 10)} sem juros</p>
              <p className="text-sm text-accent font-medium">
                {formatPrice(precoFinal * 0.95)} no Pix (5% off)
              </p>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            {semPreco ? (
              <a
                href={`https://wa.me/5538999144595?text=${encodeURIComponent(`Olá! Gostaria de consultar o preço de: ${product.nome}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-14 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-heading text-sm uppercase tracking-wider transition-colors rounded-none"
              >
                <MessageCircle className="h-5 w-5" />
                Consultar Preço via WhatsApp
              </a>
            ) : (
              <button
                onClick={handleWhatsApp}
                className="w-full h-14 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-heading text-sm uppercase tracking-wider transition-colors rounded-none"
              >
                <MessageCircle className="h-5 w-5" />
                Pedir via WhatsApp
              </button>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Atendimento\nPersonalizado' },
              { icon: ShieldCheck, label: 'Compra\nSegura' },
              { icon: MessageCircle, label: 'Orçar via\nWhatsApp' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="text-center p-3 bg-muted">
                <Icon className="h-5 w-5 mx-auto text-accent mb-1.5" />
                <p className="text-[10px] font-heading uppercase tracking-wider whitespace-pre-line leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="border-b border-border pb-3 mb-6">
          <h2 className="font-heading text-xs uppercase tracking-wider">Descrição</h2>
        </div>
        <p className="text-sm leading-relaxed max-w-2xl text-muted-foreground">
          {product.descricao || 'Informação detalhada do produto em breve.'}
        </p>
      </div>

      {relatedProducts.filter(p => p.id !== product.id).length > 0 && (
        <div className="mt-20">
          <h2 className="font-heading font-extrabold text-xl uppercase tracking-tight mb-8">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.filter(p => p.id !== product.id).slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
