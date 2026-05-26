import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { evolutionApi } from '@/lib/evolutionApi';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  LayoutDashboard, Package, ShoppingBag, Settings, Menu, X,
  LogOut, ChevronRight, Store, Users, MessageCircle, Power, Loader2, RefreshCw, PauseCircle, PlayCircle,
} from 'lucide-react';

const INSTANCE = import.meta.env.VITE_EVOLUTION_INSTANCE_NAME || 'lili-materiais';

const NAV = [
  { path: '/admin',                 label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { path: '/admin/produtos',        label: 'Produtos',      icon: Package },
  { path: '/admin/pedidos',         label: 'Pedidos',       icon: ShoppingBag },
  { path: '/admin/vendedores',      label: 'Vendedores',    icon: Users },
  { path: '/admin/configuracoes',   label: 'Configurações', icon: Settings },
];

// ── Painel WhatsApp Bot ────────────────────────────────────────────────────────
function WhatsAppBotPanel() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: statusData, isLoading: loadingStatus } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: () => evolutionApi.getStatus(INSTANCE),
    refetchInterval: 8000,
    retry: false,
    throwOnError: false,
  });

  const { data: pausedValue } = useQuery({
    queryKey: ['bot-paused'],
    queryFn: () => api.config.get('bot_pausado'),
    refetchInterval: 10000,
    throwOnError: false,
  });
  const paused = pausedValue === true;

  const instanceState =
    statusData?.instance?.state ??
    statusData?.instance?.connectionStatus ??
    statusData?.state ?? null;
  const connected = instanceState === 'open';

  // Detecta mudança de conexão e sincroniza bot_pausado no Supabase
  const prevConnectedRef = useRef(null);
  useEffect(() => {
    // Só age após o primeiro status real (evita disparar na montagem)
    if (loadingStatus && !statusData) return;
    const prev = prevConnectedRef.current;
    if (prev === null) {
      prevConnectedRef.current = connected;
      return;
    }
    if (prev === connected) return;
    prevConnectedRef.current = connected;

    if (!connected) {
      // Instância desconectada ou deletada (de qualquer lugar)
      api.config.set('bot_pausado', true).catch(() => {});
    } else {
      // Reconectou — retoma o bot automaticamente
      api.config.set('bot_pausado', false).catch(() => {});
    }
  }, [connected, loadingStatus, statusData]);

  const { data: qrData, isLoading: loadingQR, refetch: refetchQR } = useQuery({
    queryKey: ['whatsapp-qr'],
    queryFn: async () => {
      try {
        return await evolutionApi.getQRCode(INSTANCE);
      } catch {
        await evolutionApi.createInstance(INSTANCE);
        return evolutionApi.getQRCode(INSTANCE);
      }
    },
    enabled: open && !connected && !loadingStatus,
    refetchInterval: open && !connected ? 20000 : false,
    retry: false,
    throwOnError: false,
  });

  const { mutate: togglePause, isPending: togglingPause } = useMutation({
    mutationFn: () => api.config.set('bot_pausado', !paused),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-paused'] });
      toast.success(paused ? 'Bot retomado' : 'Bot pausado');
    },
    onError: () => toast.error('Erro ao alterar estado do bot'),
  });

  const { mutate: disconnect, isPending: disconnecting } = useMutation({
    mutationFn: () => evolutionApi.disconnectAndDelete(INSTANCE),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-status'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-qr'] });
      queryClient.invalidateQueries({ queryKey: ['bot-paused'] });
      api.config.set('bot_pausado', true).catch(() => {});
      toast.success('Bot desconectado e instância removida');
    },
    onError: (err) => toast.error('Erro ao desconectar: ' + err.message),
  });

  const qrBase64 = qrData?.base64 ?? qrData?.qrcode?.base64;

  const headerColor = !connected
    ? 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
    : paused
    ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
    : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100';

  const dotColor = !connected ? 'bg-gray-300' : paused ? 'bg-yellow-400' : 'bg-green-500';

  const headerLabel = !connected ? 'Bot offline' : paused ? 'Bot pausado' : 'Bot ativo';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="WhatsApp Bot"
        className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${headerColor}`}
      >
        <MessageCircle className="h-4 w-4" />
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
        <span className="hidden sm:inline">{headerLabel}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  !connected ? 'bg-gray-100' : paused ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <MessageCircle className={`h-4 w-4 ${
                    !connected ? 'text-gray-400' : paused ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">WhatsApp Bot</p>
                  <p className={`text-[11px] font-medium ${
                    !connected ? 'text-gray-400' : paused ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {loadingStatus && !statusData ? 'Verificando...' : headerLabel}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {loadingStatus && !statusData ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-400">
                  <Loader2 className="h-7 w-7 animate-spin" />
                  <p className="text-sm">Verificando conexão...</p>
                </div>
              ) : connected ? (
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${paused ? 'bg-yellow-100' : 'bg-green-100'}`}>
                    {paused
                      ? <PauseCircle className="h-10 w-10 text-yellow-500" />
                      : <MessageCircle className="h-10 w-10 text-green-500" />
                    }
                  </div>

                  <div className="text-center">
                    <p className="font-semibold text-gray-900">
                      {paused ? 'Bot pausado' : 'Robô ativo'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {paused
                        ? 'O bot está conectado mas não responde clientes.'
                        : 'WhatsApp conectado e respondendo clientes.'}
                    </p>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex flex-col gap-2.5 w-full">
                    {/* Pausar / Retomar */}
                    <button
                      onClick={() => togglePause()}
                      disabled={togglingPause}
                      className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                        paused
                          ? 'border-green-200 text-green-700 hover:bg-green-50'
                          : 'border-yellow-200 text-yellow-700 hover:bg-yellow-50'
                      }`}
                    >
                      {togglingPause ? <Loader2 className="h-4 w-4 animate-spin" /> : paused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
                      {paused ? 'Retomar bot' : 'Pausar bot'}
                    </button>

                    {/* Desconectar e remover instância */}
                    <button
                      onClick={() => {
                        if (!confirm('Desconectar o WhatsApp e remover a instância? Você precisará escanear o QR Code novamente para reconectar.')) return;
                        disconnect();
                      }}
                      disabled={disconnecting}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors disabled:opacity-60"
                    >
                      {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
                      Desconectar e remover instância
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-400 text-center">
                    "Pausar" mantém o WhatsApp conectado mas para as respostas automáticas.<br />
                    "Desconectar" encerra a sessão e apaga a instância.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-gray-600 text-center">
                    Escaneie o QR Code com o WhatsApp do celular da loja para conectar o robô.
                  </p>

                  {loadingQR ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
                      <Loader2 className="h-7 w-7 animate-spin" />
                      <p className="text-xs">Gerando QR Code...</p>
                    </div>
                  ) : qrBase64 ? (
                    <img
                      src={qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                      alt="QR Code WhatsApp"
                      className="w-52 h-52 rounded-xl border border-gray-100 object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
                      <MessageCircle className="h-10 w-10 opacity-30" />
                      <p className="text-xs text-center">QR Code não disponível.<br />Tente atualizar.</p>
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-1">
                    <p className="text-[11px] text-gray-400">O QR atualiza automaticamente a cada 20s</p>
                    <button
                      onClick={() => refetchQR()}
                      disabled={loadingQR}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium mt-1"
                    >
                      <RefreshCw className={`h-3 w-3 ${loadingQR ? 'animate-spin' : ''}`} />
                      Atualizar QR Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Layout principal ───────────────────────────────────────────────────────────
export default function AdminLayout() {
  const { user, isAdmin, isLoadingAuth, logout } = useAuth();
  const location   = useLocation();
  const [open, setOpen] = useState(false);

  if (isLoadingAuth) return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin) return <Navigate to="/" replace />;

  const isActive = (item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const initials = (user?.user_metadata?.full_name || user?.email || 'A')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-100 flex items-start">

      {/* overlay mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 bg-gray-900 z-50 flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:sticky
      `}>
        {/* Cabeçalho da sidebar */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 flex-shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-primary rounded flex items-center justify-center flex-shrink-0">
              <Store className="h-4 w-4 text-gray-900" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Lili Materiais</p>
              <p className="text-gray-500 text-[10px] mt-0.5">Painel Admin</p>
            </div>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-3">Menu</p>
          {NAV.map(item => {
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary text-gray-900 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
                {active && <ChevronRight className="h-3 w-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Usuário */}
        <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-gray-900">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {user?.user_metadata?.full_name || 'Admin'}
              </p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ── Conteúdo principal ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center gap-4 sticky top-0 z-30 flex-shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Admin</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            <span className="text-gray-800 font-semibold capitalize">
              {location.pathname.replace('/admin/', '').replace('/admin', 'Dashboard')}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <WhatsAppBotPanel />

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors font-medium"
            >
              <Store className="h-4 w-4" />
              Ver loja
            </Link>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
