import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { uploadImage } from '@/lib/cloudinary';
import { CATEGORIES } from '@/lib/categories';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Loader2, Upload, X, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY = {
  nome: '', descricao: '', preco: '', preco_promocional: '',
  marca: '', categoria: '', imagem: '', link: '',
  estoque: '', ativo: true, promocao: false,
};

function Field({ label, required = false, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";
const sectionCls = "text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2 pb-1 border-b border-gray-100";

export default function ProductFormModal({ open, onClose, product, onSaved }) {
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState(null);
  const pendingRevoke             = useRef(null);

  useEffect(() => {
    if (product) {
      setForm({ ...EMPTY, ...product, preco: product.preco ?? '', preco_promocional: product.preco_promocional ?? '', estoque: product.estoque ?? '' });
      setPreview(product.imagem || null);
    } else {
      setForm(EMPTY);
      setPreview(null);
    }
  }, [product, open]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // Revoga blob URLs apenas depois do React confirmar a nova URL no DOM
  useEffect(() => {
    const url = pendingRevoke.current;
    if (url) {
      pendingRevoke.current = null;
      URL.revokeObjectURL(url);
    }
  }, [preview]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setUploading(true);
    try {
      const url = await uploadImage(file);
      set('imagem', url);
      pendingRevoke.current = localUrl;
      setPreview(url);
    } catch (err) {
      toast.error('Erro ao fazer upload: ' + err.message);
      pendingRevoke.current = localUrl;
      setPreview(form.imagem || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    set('imagem', '');
    setPreview(null);
  };

  const handleSave = async () => {
    if (!form.nome?.trim()) {
      toast.error('Preencha o nome do produto');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nome:              form.nome.trim(),
        descricao:         form.descricao?.trim()  || null,
        preco:             form.preco !== '' ? parseFloat(form.preco) : null,
        preco_promocional: form.preco_promocional   ? parseFloat(form.preco_promocional) : null,
        marca:             form.marca?.trim()       || null,
        categoria:         form.categoria,
        imagem:            form.imagem?.trim()      || null,
        link:              form.link?.trim()        || null,
        estoque:           form.estoque !== ''      ? parseInt(form.estoque) : null,
        ativo:             form.ativo,
        promocao:          form.promocao,
      };
      if (product?.id) {
        await api.entities.Product.update(product.id, payload);
        toast.success('Produto atualizado');
      } else {
        await api.entities.Product.create(payload);
        toast.success('Produto criado');
      }
      onSaved();
    } catch (err) {
      toast.error('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined} className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-xl">
        <DialogHeader className="px-6 py-5 border-b border-gray-100">
          <DialogTitle className="font-bold text-lg text-gray-900">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">

          {/* Informações gerais */}
          <p className={sectionCls}>Informações Gerais</p>

          <Field label="Nome" required>
            <input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome do produto" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Marca">
              <input value={form.marca} onChange={e => set('marca', e.target.value)} placeholder="Ex: Votoran, Weber..." className={inputCls} />
            </Field>
            <Field label="Categoria">
              <select value={form.categoria} onChange={e => set('categoria', e.target.value)} className={inputCls}>
                <option value="">Selecionar...</option>
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
            </Field>
          </div>

          <Field label="Descrição">
            <textarea
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              rows={3}
              placeholder="Descrição completa do produto"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
            />
          </Field>

          {/* Preços */}
          <p className={sectionCls}>Preços</p>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Preço (R$)">
              <input type="number" step="0.01" min="0" value={form.preco} onChange={e => set('preco', e.target.value)} placeholder="Deixe vazio para 'Consulte-nos'" className={inputCls} />
            </Field>
            <Field label="Preço Promocional (R$)">
              <input type="number" step="0.01" min="0" value={form.preco_promocional} onChange={e => set('preco_promocional', e.target.value)} placeholder="0,00" className={inputCls} />
            </Field>
          </div>

          {/* Estoque */}
          <p className={sectionCls}>Estoque</p>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantidade (unidades)">
              <input type="number" min="0" value={form.estoque} onChange={e => set('estoque', e.target.value)} placeholder="0" className={inputCls} />
            </Field>
            <Field label="Link Externo">
              <input value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://..." className={inputCls} />
            </Field>
          </div>

          {/* Imagem */}
          <p className={sectionCls}>Imagem</p>

          {/* Preview */}
          <div className="flex items-start gap-4">
            <div className="relative w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
              {preview ? (
                <>
                  <img src={preview} alt="" className="w-full h-full object-contain" />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                  {!uploading && (
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </>
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-300" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <label className="flex items-center gap-2 w-full cursor-pointer bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                {uploading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Enviando...' : 'Selecionar arquivo'}
              </label>
              <input
                value={form.imagem}
                onChange={e => { set('imagem', e.target.value); setPreview(e.target.value || null); }}
                placeholder="Ou cole uma URL de imagem..."
                className={inputCls}
              />
            </div>
          </div>

          {/* Configurações */}
          <p className={sectionCls}>Configurações</p>

          <div className="flex items-center gap-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={form.ativo} onCheckedChange={v => set('ativo', v)} />
              <span className="text-sm text-gray-700 font-medium">Produto ativo</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={form.promocao} onCheckedChange={v => set('promocao', v)} />
              <span className="text-sm text-gray-700 font-medium">Em promoção</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-gray-900 bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {product ? 'Salvar Alterações' : 'Criar Produto'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
