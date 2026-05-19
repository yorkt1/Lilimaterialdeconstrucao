import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CATEGORIES } from '@/lib/categories';
import { Upload, Save, Loader2, Info, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const DEFAULT_SLIDE = {
  title: 'Novo Banner',
  subtitle: 'Descrição do banner',
  cta: 'Explorar',
  category: '',
  image_url: '',
  active: true,
  sort_order: 0,
};

export default function AdminBanners() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(null);
  const [saving, setSaving] = useState(false);
  const [localSlides, setLocalSlides] = useState(null);

  const { data: dbSlides = [], isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => api.entities.Banner.list({ column: 'sort_order', order: 'asc' }),
  });

  // Use local edits if they exist, otherwise use DB data
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
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      update(id, field, file_url);
    } catch (err) {
      toast.error('Erro ao fazer upload: ' + err.message);
    } finally {
      setUploading(null);
    }
  };

  const handleAddSlide = async () => {
    setSaving(true);
    try {
      const newSlide = await api.entities.Banner.create({
        ...DEFAULT_SLIDE,
        sort_order: slides.length,
      });
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
            title: slide.title,
            subtitle: slide.subtitle,
            cta: slide.cta,
            category: slide.category,
            image_url: slide.image_url,
            mobile_image_url: slide.mobile_image_url || null,
            active: slide.active,
            sort_order: slide.sort_order,
          })
        )
      );
      await queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setLocalSlides(null);
      toast.success('Banners salvos com sucesso!');
    } catch (err) {
      toast.error('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-2xl uppercase tracking-tight">Banners / Hero</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure os slides da página inicial — salvo no banco de dados</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleAddSlide}
            disabled={saving}
            className="font-heading text-xs uppercase tracking-wider rounded-none h-10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Slide
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !localSlides}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-heading text-xs uppercase tracking-wider rounded-none h-10"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-2 bg-accent/5 border border-accent/20 p-4 text-sm text-muted-foreground">
        <Info className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
        <p>Os slides são salvos diretamente no banco de dados Supabase. Clique em <strong>Salvar</strong> após editar.</p>
      </div>

      {slides.length === 0 ? (
        <div className="bg-card border border-border p-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">Nenhum banner cadastrado ainda.</p>
          <Button onClick={handleAddSlide} disabled={saving} className="rounded-none font-heading text-xs uppercase tracking-wider">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Slide
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {slides.map((slide, idx) => (
            <div key={slide.id} className="bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider">Slide {idx + 1}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Ativo</span>
                    <Switch checked={slide.active} onCheckedChange={(v) => update(slide.id, 'active', v)} />
                  </div>
                  <button
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title="Excluir slide"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-heading">Título</Label>
                    <Input value={slide.title || ''} onChange={(e) => update(slide.id, 'title', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-heading">Subtítulo</Label>
                    <Input value={slide.subtitle || ''} onChange={(e) => update(slide.id, 'subtitle', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-heading">Texto do Botão</Label>
                    <Input value={slide.cta || ''} onChange={(e) => update(slide.id, 'cta', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-heading">Link (Categoria)</Label>
                    <select
                      value={slide.category || ''}
                      onChange={(e) => update(slide.id, 'category', e.target.value)}
                      className="w-full h-10 px-3 border border-input bg-background text-sm rounded-none"
                    >
                      <option value="">Sem link</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Imagem Desktop */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-heading">
                      Imagem Desktop <span className="text-muted-foreground font-normal normal-case">(1920×336px)</span>
                    </Label>
                    {slide.image_url && (
                      <div className="bg-muted overflow-hidden" style={{ aspectRatio: '1920/336' }}>
                        <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <Input
                      value={slide.image_url || ''}
                      onChange={(e) => update(slide.id, 'image_url', e.target.value)}
                      placeholder="URL da imagem desktop..."
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, slide.id, 'image_url')}
                      />
                      <Button variant="outline" asChild disabled={uploading === `${slide.id}_image_url`} className="rounded-none w-full font-heading text-xs uppercase tracking-wider">
                        <span>
                          {uploading === `${slide.id}_image_url`
                            ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enviando...</>
                            : <><Upload className="h-4 w-4 mr-2" />Upload Desktop</>
                          }
                        </span>
                      </Button>
                    </label>
                  </div>

                  {/* Imagem Mobile */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-heading">
                      Imagem Mobile <span className="text-muted-foreground font-normal normal-case">(opcional — para celular)</span>
                    </Label>
                    {slide.mobile_image_url && (
                      <div className="bg-muted overflow-hidden aspect-[3/2]">
                        <img src={slide.mobile_image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <Input
                      value={slide.mobile_image_url || ''}
                      onChange={(e) => update(slide.id, 'mobile_image_url', e.target.value)}
                      placeholder="URL da imagem mobile..."
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, slide.id, 'mobile_image_url')}
                      />
                      <Button variant="outline" asChild disabled={uploading === `${slide.id}_mobile_image_url`} className="rounded-none w-full font-heading text-xs uppercase tracking-wider">
                        <span>
                          {uploading === `${slide.id}_mobile_image_url`
                            ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enviando...</>
                            : <><Upload className="h-4 w-4 mr-2" />Upload Mobile</>
                          }
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {slides.length > 0 && (
        <Button
          onClick={handleSave}
          disabled={saving || !localSlides}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-heading text-xs uppercase tracking-wider rounded-none h-12 w-full"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Salvar Configurações
        </Button>
      )}
    </div>
  );
}