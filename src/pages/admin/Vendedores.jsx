import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { evolutionApi } from '@/lib/evolutionApi';
import { Plus, Pencil, Trash2, Search, CheckCircle, XCircle, Phone, User, QrCode, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const CARGOS = ['Vendedor', 'Atendente', 'Gerente', 'Caixa', 'Estoquista', 'Outro'];

// ── Modal QR Code Evolution API ──────────────────────────────────────────────
function QRCodeModal({ open, onClose, vendedor }) {
  const [status, setStatus] = useState('idle'); // idle | loading | qr | connected | error
  const [qrBase64, setQrBase64] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef(null);
  const queryClient = useQueryClient();

  const instanceName = vendedor ? toInstanceName(vendedor.nome) : '';

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  };

  const startPolling = (name) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await evolutionApi.getStatus(name);
        const state = res?.instance?.connectionStatus ?? res?.instance?.state ?? res?.state;
        if (state === 'open') {
          setStatus('connected');
          stopPolling();
          // Salva apenas o instance_name — api_key e url ficam na tabela configuracoes
          await api.entities.Vendedor.update(vendedor.id, {
            instance_name: instanceName,
          }).catch(() => {});
          queryClient.invalidateQueries({ queryKey: ['evolution-instances'] });
          queryClient.invalidateQueries({ queryKey: ['admin-vendedores'] });
        }
      } catch {
        // ignora erros de polling
      }
    }, 4000);
  };

  const connect = async () => {
    setStatus('loading');
    setQrBase64(null);
    setErrorMsg('');
    try {
      // Tenta criar a instância (ignora erro se já existir)
      try { await evolutionApi.createInstance(instanceName); } catch {}

      const res = await evolutionApi.getQRCode(instanceName);
      const base64 = res?.base64 ?? res?.qrcode?.base64 ?? res?.qr;

      if (!base64) throw new Error('QR code não retornado pela API');

      setQrBase64(base64);
      setStatus('qr');
      startPolling(instanceName);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (open) {
      setStatus('idle');
      setQrBase64(null);
      setErrorMsg('');
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-bold text-lg flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Conectar WhatsApp
          </DialogTitle>
        </DialogHeader>

        {vendedor && (
          <p className="text-sm text-gray-500">
            Vendedor: <span className="font-semibold text-gray-800">{vendedor.nome}</span>
          </p>
        )}

        <div className="flex flex-col items-center gap-4 py-2">
          {status === 'idle' && (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <QrCode className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Clique em "Gerar QR Code" para conectar o WhatsApp deste vendedor ao bot.
              </p>
              <Button
                onClick={connect}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold"
              >
                Gerar QR Code
              </Button>
            </>
          )}

          {status === 'loading' && (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm text-gray-500">Gerando QR code...</p>
            </>
          )}

          {status === 'qr' && qrBase64 && (
            <>
              <img
                src={qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                alt="QR Code WhatsApp"
                className="w-56 h-56 border border-gray-200 rounded-lg"
              />
              <p className="text-sm text-gray-500 text-center">
                Abra o WhatsApp → Dispositivos conectados → Conectar dispositivo → escaneie o QR code.
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg w-full justify-center">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Aguardando conexão...
              </div>
              <Button variant="outline" size="sm" onClick={connect} className="w-full">
                Gerar novo QR code
              </Button>
            </>
          )}

          {status === 'connected' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Wifi className="h-8 w-8 text-green-600" />
              </div>
              <p className="font-semibold text-green-700">WhatsApp conectado!</p>
              <p className="text-sm text-gray-500 text-center">
                O WhatsApp de <strong>{vendedor?.nome}</strong> está conectado ao bot.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <WifiOff className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-sm text-red-600 text-center">{errorMsg}</p>
              <Button onClick={connect} variant="outline" className="w-full">
                Tentar novamente
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const EMPTY_FORM = { nome: '', telefone: '', cargo: 'Vendedor', ativo: true };

function VendedorModal({ open, onClose, vendedor, onSaved }) {
  const [form, setForm] = useState(vendedor ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setForm(vendedor ?? EMPTY_FORM);
  }, [vendedor, open]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) return toast.error('Nome obrigatório');
    if (!form.telefone.trim()) return toast.error('Telefone obrigatório');

    setSaving(true);
    try {
      if (vendedor?.id) {
        await api.entities.Vendedor.update(vendedor.id, {
          nome: form.nome.trim(),
          telefone: form.telefone.replace(/\D/g, ''),
          cargo: form.cargo,
          ativo: form.ativo,
        });
        toast.success('vendedor atualizado');
      } else {
        await api.entities.Vendedor.create({
          nome: form.nome.trim(),
          telefone: form.telefone.replace(/\D/g, ''),
          cargo: form.cargo,
          ativo: true,
        });
        toast.success('vendedor cadastrado');
      }
      onSaved();
    } catch {
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold text-lg">
            {vendedor ? 'editar vendedor' : 'novo vendedor'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome completo</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={e => set('nome', e.target.value)}
              placeholder="Ex: João Silva"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telefone">
              Telefone WhatsApp
              <span className="ml-1 text-xs text-gray-400">(somente números)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="telefone"
                value={form.telefone}
                onChange={e => set('telefone', e.target.value)}
                placeholder="5538999000000"
                className="pl-9"
              />
            </div>
            <p className="text-xs text-gray-400">Formato: 55 + DDD + número (ex: 5538999144595)</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cargo">Cargo</Label>
            <select
              id="cargo"
              value={form.cargo}
              onChange={e => set('cargo', e.target.value)}
              className="w-full h-10 px-3 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            >
              {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {vendedor && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set('ativo', !form.ativo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.ativo ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.ativo ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <Label className="cursor-pointer" onClick={() => set('ativo', !form.ativo)}>
                {form.ativo ? 'Ativo' : 'Inativo'}
              </Label>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-gray-900 font-semibold" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const toInstanceName = (nome) =>
  `vendedor-${nome
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30)}`;

export default function AdminVendedores() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const queryClient = useQueryClient();

  const { data: vendedores = [], isLoading } = useQuery({
    queryKey: ['admin-vendedores'],
    queryFn: () => api.entities.Vendedor.list({ column: 'nome', order: 'asc' }),
  });

  const { data: instances = [] } = useQuery({
    queryKey: ['evolution-instances'],
    queryFn: () => evolutionApi.fetchInstances(),
    refetchInterval: 20000,
    retry: false,
  });

  const instanceStatusMap = instances.reduce((acc, item) => {
    const name = item?.instance?.instanceName ?? item?.instanceName;
    const state = item?.instance?.connectionStatus ?? item?.state ?? item?.instance?.state;
    if (name) acc[name] = state;
    return acc;
  }, {});

  const getBotStatus = (v) => instanceStatusMap[toInstanceName(v.nome)];

  const filtered = vendedores.filter(v =>
    !search || v.nome?.toLowerCase().includes(search.toLowerCase()) || v.cargo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id, nome) => {
    if (!confirm(`Excluir "${nome}"?`)) return;
    try {
      await api.entities.Vendedor.delete(id);
      queryClient.invalidateQueries({ queryKey: ['admin-vendedores'] });
      toast.success('vendedor removido');
    } catch {
      toast.error('Erro ao remover');
    }
  };

  const handleToggleAtivo = async (v) => {
    try {
      await api.entities.Vendedor.update(v.id, { ativo: !v.ativo });
      queryClient.invalidateQueries({ queryKey: ['admin-vendedores'] });
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const openWhatsApp = (telefone) => {
    window.open(`https://wa.me/${telefone}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">vendedores</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} vendedor(es)</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          novo vendedor
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou cargo..."
          className="w-full pl-10 pr-4 h-10 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">vendedor</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Cargo</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">WhatsApp</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden lg:table-cell">Bot</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-8 bg-gray-100 animate-pulse rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <User className="h-10 w-10 mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">nenhum vendedor cadastrado</p>
                  </td>
                </tr>
              ) : filtered.map(v => (
                <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-gray-500">
                          {v.nome?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">{v.nome}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-full">
                      {v.cargo}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <button
                      onClick={() => openWhatsApp(v.telefone)}
                      className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {v.telefone}
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <button
                      onClick={() => handleToggleAtivo(v)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                        v.ativo
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {v.ativo
                        ? <><CheckCircle className="h-3 w-3" /> Ativo</>
                        : <><XCircle className="h-3 w-3" /> Inativo</>
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {(() => {
                      const state = getBotStatus(v);
                      const salvo = !!v.instance_name;

                      if (state === 'open') return (
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full w-fit">
                            <Wifi className="h-3 w-3" /> Conectado
                          </span>
                          {salvo && (
                            <span className="text-[10px] text-gray-400 pl-1">{v.instance_name}</span>
                          )}
                        </div>
                      );

                      if (salvo) return (
                        <div className="flex flex-col gap-1">
                          <button onClick={() => setQrModal(v)} className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full hover:bg-red-100 transition-colors w-fit">
                            <WifiOff className="h-3 w-3" /> Desconectado
                          </button>
                          <span className="text-[10px] text-gray-400 pl-1">{v.instance_name}</span>
                        </div>
                      );

                      return (
                        <button onClick={() => setQrModal(v)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors">
                          <QrCode className="h-3.5 w-3.5" />
                          Conectar
                        </button>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setQrModal(v)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors lg:hidden"
                        title="Conectar WhatsApp"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => { setEditing(v); setModalOpen(true); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id, v.nome)}
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

      <VendedorModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        vendedor={editing}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-vendedores'] });
          setModalOpen(false);
          setEditing(null);
        }}
      />

      <QRCodeModal
        open={!!qrModal}
        onClose={() => setQrModal(null)}
        vendedor={qrModal}
      />
    </div>
  );
}
