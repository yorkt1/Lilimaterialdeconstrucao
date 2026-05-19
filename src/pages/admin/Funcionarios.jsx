import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, CheckCircle, XCircle, Phone, User } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const CARGOS = ['Vendedor', 'Atendente', 'Gerente', 'Caixa', 'Estoquista', 'Outro'];

const EMPTY_FORM = { nome: '', telefone: '', cargo: 'Vendedor', ativo: true };

function FuncionarioModal({ open, onClose, funcionario, onSaved }) {
  const [form, setForm] = useState(funcionario ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setForm(funcionario ?? EMPTY_FORM);
  }, [funcionario, open]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) return toast.error('Nome obrigatório');
    if (!form.telefone.trim()) return toast.error('Telefone obrigatório');

    setSaving(true);
    try {
      if (funcionario?.id) {
        await api.entities.Funcionario.update(funcionario.id, {
          nome: form.nome.trim(),
          telefone: form.telefone.replace(/\D/g, ''),
          cargo: form.cargo,
          ativo: form.ativo,
        });
        toast.success('Funcionário atualizado');
      } else {
        await api.entities.Funcionario.create({
          nome: form.nome.trim(),
          telefone: form.telefone.replace(/\D/g, ''),
          cargo: form.cargo,
          ativo: true,
        });
        toast.success('Funcionário cadastrado');
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
            {funcionario ? 'Editar Funcionário' : 'Novo Funcionário'}
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

          {funcionario && (
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

export default function AdminFuncionarios() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: funcionarios = [], isLoading } = useQuery({
    queryKey: ['admin-funcionarios'],
    queryFn: () => api.entities.Funcionario.list({ column: 'nome', order: 'asc' }),
  });

  const filtered = funcionarios.filter(f =>
    !search || f.nome?.toLowerCase().includes(search.toLowerCase()) || f.cargo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id, nome) => {
    if (!confirm(`Excluir "${nome}"?`)) return;
    try {
      await api.entities.Funcionario.delete(id);
      queryClient.invalidateQueries({ queryKey: ['admin-funcionarios'] });
      toast.success('Funcionário removido');
    } catch {
      toast.error('Erro ao remover');
    }
  };

  const handleToggleAtivo = async (f) => {
    try {
      await api.entities.Funcionario.update(f.id, { ativo: !f.ativo });
      queryClient.invalidateQueries({ queryKey: ['admin-funcionarios'] });
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
          <h1 className="font-bold text-2xl text-gray-900">Funcionários</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} funcionário(s)</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Funcionário
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
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Funcionário</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Cargo</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">WhatsApp</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Status</th>
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
                    <p className="text-gray-400 text-sm">Nenhum funcionário cadastrado</p>
                  </td>
                </tr>
              ) : filtered.map(f => (
                <tr key={f.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-gray-500">
                          {f.nome?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">{f.nome}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-full">
                      {f.cargo}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <button
                      onClick={() => openWhatsApp(f.telefone)}
                      className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {f.telefone}
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <button
                      onClick={() => handleToggleAtivo(f)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                        f.ativo
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {f.ativo
                        ? <><CheckCircle className="h-3 w-3" /> Ativo</>
                        : <><XCircle className="h-3 w-3" /> Inativo</>
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditing(f); setModalOpen(true); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id, f.nome)}
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

      <FuncionarioModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        funcionario={editing}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-funcionarios'] });
          setModalOpen(false);
          setEditing(null);
        }}
      />
    </div>
  );
}
