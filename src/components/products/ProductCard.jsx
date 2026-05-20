import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/categories';

export default function ProductCard({ product }) {
  const [imgError, setImgError] = React.useState(false);
  const imagemValida = Boolean(product.imagem?.trim());

  const esgotado  = product.estoque === 0;
  const ultimas   = product.estoque > 0 && product.estoque <= 3;
  const semPreco  = product.preco == null;

  const precoFinal = !semPreco && product.preco_promocional && product.preco_promocional < product.preco
    ? product.preco_promocional
    : product.preco;

  const precoPix = semPreco ? null : precoFinal * 0.95;

  const discount = !semPreco && product.preco_promocional && product.preco_promocional < product.preco
    ? Math.round((1 - product.preco_promocional / product.preco) * 100)
    : 0;

  const handleWhatsApp = (e) => {
    e.preventDefault();
    const msg = semPreco
      ? `Olá! Gostaria de consultar o preço de: ${product.nome}`
      : `Olá! Gostaria de comprar: ${product.nome} — ${formatPrice(precoFinal)}`;
    window.open(`https://wa.me/5538999144595?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="group relative bg-white border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 rounded-sm overflow-hidden flex flex-col">

      {/* Link de navegação — cobre imagem */}
      <Link
        to={`/produto/${product.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        tabIndex={0}
      >
        {/* Imagem */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">

          {esgotado ? (
            <span className="absolute top-2 left-2 z-10 bg-gray-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
              ESGOTADO
            </span>
          ) : discount > 0 ? (
            <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-sm">
              -{discount}%
            </span>
          ) : product.promocao ? (
            <span className="absolute top-2 left-2 z-10 bg-accent text-accent-foreground text-[11px] font-bold px-2 py-0.5 rounded-sm">
              OFERTA
            </span>
          ) : null}

          {ultimas && (
            <span className="absolute top-2 right-2 z-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
              ÚLTIMAS
            </span>
          )}

          {imagemValida && !imgError ? (
            <img
              src={product.imagem}
              alt={product.nome}
              className={`w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105 ${esgotado ? 'opacity-50 grayscale' : ''}`}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ShoppingCart className="h-16 w-16" />
            </div>
          )}
        </div>
      </Link>

      {/* Conteúdo */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {product.marca && (
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
            {product.marca}
          </p>
        )}

        <Link to={`/produto/${product.id}`} className="block" tabIndex={-1} aria-hidden="true">
          <h3 className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {product.nome}
          </h3>
        </Link>

        <div className="space-y-0.5">
          {semPreco ? (
            <>
              <p className="text-base font-bold text-primary">Consulte-nos</p>
              <p className="text-xs text-gray-400">Preço sob consulta</p>
            </>
          ) : (
            <>
              {product.preco_promocional && product.preco_promocional < product.preco && (
                <p className="text-xs text-gray-400 line-through">De: {formatPrice(product.preco)}</p>
              )}
              <p className="text-lg font-extrabold text-gray-900 leading-none">{formatPrice(precoFinal)}</p>
              <p className="text-xs text-green-600 font-semibold">
                No Pix: {formatPrice(precoPix)} <span className="text-gray-400 font-normal">(5% off)</span>
              </p>
              <p className="text-xs text-gray-500">ou 10x de {formatPrice(precoFinal / 10)} sem juros</p>
            </>
          )}
        </div>

        {/* Botões — mt-auto empurra sempre para o rodapé do card */}
        <div className="mt-auto pt-2">
          {esgotado ? (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-400 text-xs font-bold uppercase tracking-wider py-3 min-h-[44px] rounded-sm cursor-not-allowed"
            >
              Indisponível
            </button>
          ) : (
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold uppercase tracking-wider py-3 min-h-[44px] rounded-sm transition-colors"
            >
              <MessageCircle className="h-4 w-4 flex-shrink-0" />
              {semPreco ? 'Consultar Preço' : 'Pedir via WhatsApp'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
