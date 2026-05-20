import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Check, SkipForward, ChevronLeft, ChevronRight,
  Package, Loader2, Search, Link2
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AdminImportar() {
  const queryClient = useQueryClient();
  const [images, setImages]         = useState([]);
  const [loadingImgs, setLoadingImgs] = useState(true);
  const [imgIdx, setImgIdx]         = useState(0);
  const [prodIdx, setProdIdx]       = useState(0);
  const [linked, setLinked]         = useState(new Set());   // product ids
  const [search, setSearch]         = useState('');
  const [saving, setSaving]         = useState(false);

  const { data: products = [], isLoading: loadingProds } = useQuery({
    queryKey: ['import-products'],
    queryFn: () => api.entities.Product.list({ column: 'nome', order: 'asc' }, 500),
  });

  useEffect(() => {
    fetch('/cloudinary-images.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setImages(data); setLoadingImgs(false); })
      .catch(() => {
        toast.error('Execute: node scripts/cloudinary-fetch.js');
        setLoadingImgs(false);
      });
  }, []);

  useEffect(() => {
    setProdIdx(0);
    setSearch('');
  }, [imgIdx]);

  const isLoading = loadingImgs || loadingProds;

  // Produtos que ainda precisam de imagem Cloudinary
  const pending = products.filter(p =>
    !linked.has(p.id) && !p.imagem?.includes('cloudinary.com')
  );

  const filtered = search.trim()
    ? pending.filter(p => p.nome?.toLowerCase().includes(search.toLowerCase()))
    : pending;

  const currentImage   = images[imgIdx] ?? null;
  const currentProduct = filtered.length > 0
    ? filtered[prodIdx % filtered.length]
    : null;

  const handleAccept = async () => {
    if (!currentImage || !currentProduct || saving) return;
    setSaving(true);
    try {
      await api.entities.Product.update(currentProduct.id, { imagem: currentImage.url });
      queryClient.invalidateQueries({ queryKey: ['import-products'] });
      setLinked(prev => new Set([...prev, currentProduct.id]));
      toast.success('Vinculado!', { duration: 600 });
      setImgIdx(i => i + 1);
    } catch {
      toast.error('Erro ao vincular');
    } finally {
      setSaving(false);
    }
  };

  const handleSkipImage = () => {
    setImgIdx(i => i + 1);
  };

  const handleNextProd = () => {
    setProdIdx(i => i + 1);
  };

  const handlePrevProd = () => {
    setProdIdx(i => Math.max(0, i - 1));
  };

  // Atalhos de teclado
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'Enter' && !saving) handleAccept();
      if (e.key === 'Escape') handleSkipImage();
      if (e.key === 'ArrowRight') handleNextProd();
      if (e.key === 'ArrowLeft') handlePrevProd();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleAccept, saving]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const done = imgIdx >= images.length || pending.length === 0;

  if (done) return (
    <div className="text-center py-24">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="font-bold text-2xl text-gray-800 mb-2">Tudo pronto!</h2>
      <p className="text-gray-500">{linked.size} fotos vinculadas</p>
    </div>
  );

  const prodPos = filtered.length > 0 ? (prodIdx % filtered.length) + 1 : 0;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">Vincular Fotos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Imagem <b>{imgIdx + 1}</b> de <b>{images.length}</b> ·{' '}
            <span className="text-green-600 font-semibold">{linked.size} vinculadas</span> ·{' '}
            {pending.length} produtos sem foto
          </p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(imgIdx / images.length) * 100}%` }}
        />
      </div>

      {/* Comparação lado a lado */}
      <div className="grid grid-cols-2 gap-4">

        {/* Lado esquerdo — foto do Cloudinary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Foto no Cloudinary</span>
            <span className="ml-auto text-xs text-gray-300">{imgIdx + 1}/{images.length}</span>
          </div>
          <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
            {currentImage ? (
              <img
                key={currentImage.url}
                src={currentImage.url}
                alt="Cloudinary"
                className="w-full h-full object-contain"
              />
            ) : (
              <Package className="h-16 w-16 text-gray-200" />
            )}
          </div>
          <div className="px-4 py-3">
            <p className="text-[10px] text-gray-300 truncate">{currentImage?.public_id}</p>
          </div>
        </div>

        {/* Lado direito — produto sugerido */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Produto sugerido</span>
            {filtered.length > 0 && (
              <span className="ml-auto text-xs text-gray-400">
                {prodPos}/{filtered.length}
              </span>
            )}
          </div>

          {/* Imagem atual do produto */}
          <div className="aspect-square bg-gray-50 flex items-center justify-center p-4 relative">
            {currentProduct?.imagem ? (
              <img
                key={currentProduct.id}
                src={currentProduct.imagem}
                alt={currentProduct.nome}
                className="w-full h-full object-contain"
                onError={e => e.currentTarget.style.display = 'none'}
              />
            ) : (
              <Package className="h-16 w-16 text-gray-200" />
            )}
          </div>

          <div className="px-4 py-3 space-y-3">
            {/* Nome do produto */}
            <p className="text-sm font-semibold text-gray-800 leading-snug min-h-[2.5rem]">
              {currentProduct?.nome ?? <span className="text-gray-300 italic">Nenhum produto encontrado</span>}
            </p>

            {/* Navegação entre produtos */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevProd}
                disabled={prodIdx === 0}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              </button>
              <button
                onClick={handleNextProd}
                disabled={filtered.length === 0}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </button>
              <p className="text-[11px] text-gray-400">← → para navegar</p>
            </div>

            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                value={search}
                onChange={e => { setSearch(e.target.value); setProdIdx(0); }}
                placeholder="Buscar produto..."
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-3">
        <button
          onClick={handleSkipImage}
          className="flex items-center justify-center gap-2 px-5 h-12 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <SkipForward className="h-4 w-4" />
          Pular imagem
          <span className="text-xs text-gray-300">(Esc)</span>
        </button>

        <button
          onClick={handleAccept}
          disabled={saving || !currentProduct}
          className="flex-1 h-12 bg-primary hover:bg-primary/90 text-gray-900 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Link2 className="h-4 w-4" />
          }
          {saving ? 'Vinculando...' : 'Sim, é esse produto!'}
          {!saving && <span className="text-xs opacity-50">(Enter)</span>}
        </button>
      </div>

      <p className="text-xs text-gray-300 text-center">
        Enter = aceitar · Esc = pular imagem · ← → = navegar produtos
      </p>
    </div>
  );
}
