import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CATEGORIES } from '@/lib/categories';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Upload, Save, Loader2, Plus, Trash2, Images, GripVertical } from 'lucide-react';
import { uploadImage } from '@/lib/cloudinary';

const DEFAULT_SLIDE = {
  title: 'Novo Banner',
  subtitle: '',
  cta: 'Ver Ofertas',
  category: '',
  image_url: '',
  mobile_image_url: '',
  active: true,
  sort_order: 0,
};

export default function AdminConfiguracoes() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-2xl text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie as configurações gerais da loja</p>
      </div>

      <BannersSection />
    </div>
  );
}

function BannersSection() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(null);
  const [saving, setSaving] = useState(false);
  const [localSlides, setLocalSlides] = useState(null);

  const { data: dbSlides = [], isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => api.entities.Banner.list({ column: 'sort_order', order: 'asc' }),
  });

  const slides = localSlides ?? dbSlides;

  const update = (id, field, value) => {
    setLocalSlides((prev) =>
      (prev ?? dbSlides).map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleImageUpload = async (e, id, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const key = `${id}_${field}`;
    setUploading(key);
    try {
      const url = await uploadImage(file);
      update(id, field, url);
    } catch (err) {
      toast.error('Erro ao fazer upload: ' + err.message);
    } finally {
      setUploading(null);
    }
  };

  const handleAddSlide = async () => {
    setSaving(true);
    try {
      await api.entities.Banner.create({ ...DEFAULT_SLIDE, sort_order: slides.length });
      await queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setLocalSlides(null);
      toast.success('Novo slide criado');
    } catch (err) {
      toast.error('Erro ao criar slide: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlide = async (id) => {
    if (!confirm('Excluir este slide?')) return;
    try {
      await api.entities.Banner.delete(id);
      await queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setLocalSlides(null);
      toast.success('Slide excluído');
    } catch (err) {
      toast.error('Erro ao excluir: ' + err.message);
    }
  };

  const handleSave = async () => {
    if (!localSlides) return;
    setSaving(true);
    try {
      await Promise.all(
        localSlides.map((slide) =>
          api.entities.Banner.update(slide.id, {
            title:            slide.title,
            subtitle:         slide.subtitle,
            cta:              slide.cta,
            category:         slide.category,
            image_url:        slide.image_url,
            mobile_image_url: slide.mobile_image_url || null,
            active:           slide.active,
            sort_order:       slide.sort_order,
          })
        )
      );
      await queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setLocalSlides(null);
      toast.success('Banners salvos!');
    } catch (err) {
      toast.error('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header da seção */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
            <Images className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Carrossel de Banners</h2>
            <p className="text-xs text-gray-400">Slides exibidos na página inicial</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddSlide}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo slide
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !localSlides}
            className="flex items-center gap-1.5 text-sm font-semibold bg-primary hover:bg-primary/90 text-gray-900 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Salvar
          </button>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />)}
          </div>
        ) : slides.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Images className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum banner cadastrado</p>
            <button
              onClick={handleAddSlide}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              + Criar primeiro slide
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, idx) => (
              <SlideCard
                key={slide.id}
                slide={slide}
                idx={idx}
                uploading={uploading}
                onUpdate={update}
                onDelete={handleDeleteSlide}
                onImageUpload={handleImageUpload}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SlideCard({ slide, idx, uploading, onUpdate, onDelete, onImageUpload }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${slide.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
      {/* Cabeçalho do slide */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
        <GripVertical className="h-4 w-4 text-gray-300 cursor-grab flex-shrink-0" />

        {/* Thumb */}
        <div className="w-14 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
          {slide.image_url
            ? <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Images className="h-3 w-3 text-gray-400" /></div>
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{slide.title || `Slide ${idx + 1}`}</p>
          <p className="text-xs text-gray-400">{slide.subtitle || 'Sem subtítulo'}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <Switch
              checked={slide.active}
              onCheckedChange={v => onUpdate(slide.id, 'active', v)}
            />
            <span className="text-xs text-gray-500">{slide.active ? 'Ativo' : 'Inativo'}</span>
          </label>
          <button
            onClick={() => setExpanded(p => !p)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {expanded ? 'Fechar' : 'Editar'}
          </button>
          <button
            onClick={() => onDelete(slide.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Painel de edição expandido */}
      {expanded && (
        <div className="p-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Textos */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-500 font-medium">Título</Label>
              <Input
                value={slide.title || ''}
                onChange={e => onUpdate(slide.id, 'title', e.target.value)}
                className="mt-1 h-9 text-sm"
                placeholder="Ex: Promoção de Verão"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 font-medium">Subtítulo</Label>
              <Input
                value={slide.subtitle || ''}
                onChange={e => onUpdate(slide.id, 'subtitle', e.target.value)}
                className="mt-1 h-9 text-sm"
                placeholder="Descrição breve"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 font-medium">Texto do botão</Label>
              <Input
                value={slide.cta || ''}
                onChange={e => onUpdate(slide.id, 'cta', e.target.value)}
                className="mt-1 h-9 text-sm"
                placeholder="Ex: Ver Ofertas"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 font-medium">Link (categoria)</Label>
              <select
                value={slide.category || ''}
                onChange={e => onUpdate(slide.id, 'category', e.target.value)}
                className="mt-1 w-full h-9 px-3 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Sem link específico</option>
                {CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Imagens */}
          <div className="space-y-4">
            <ImageField
              label="Imagem Desktop"
              hint="1920×336px recomendado"
              value={slide.image_url}
              onChange={v => onUpdate(slide.id, 'image_url', v)}
              uploadKey={`${slide.id}_image_url`}
              uploading={uploading}
              onUpload={e => onImageUpload(e, slide.id, 'image_url')}
            />
            <ImageField
              label="Imagem Mobile"
              hint="Opcional — para celular"
              value={slide.mobile_image_url}
              onChange={v => onUpdate(slide.id, 'mobile_image_url', v)}
              uploadKey={`${slide.id}_mobile_image_url`}
              uploading={uploading}
              onUpload={e => onImageUpload(e, slide.id, 'mobile_image_url')}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ImageField({ label, hint, value, onChange, uploadKey, uploading, onUpload }) {
  return (
    <div className="space-y-1.5">
      <div>
        <Label className="text-xs text-gray-500 font-medium">{label}</Label>
        {hint && <span className="text-[11px] text-gray-400 ml-1.5">{hint}</span>}
      </div>
      {value && (
        <div className="rounded-md overflow-hidden border border-gray-100 bg-gray-50" style={{ aspectRatio: '4/1' }}>
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <Input
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="Cole a URL da imagem..."
        className="h-9 text-sm"
      />
      <label className="flex items-center justify-center gap-2 w-full h-9 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors text-xs text-gray-500">
        <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={!!uploading} />
        {uploading === uploadKey
          ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enviando...</>
          : <><Upload className="h-3.5 w-3.5" /> Fazer upload</>
        }
      </label>
    </div>
  );
}
