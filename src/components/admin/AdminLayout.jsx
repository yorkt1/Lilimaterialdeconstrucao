import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { LayoutDashboard, Package, ShoppingBag, Settings, Menu, X, LogOut, ChevronRight, Store, Users } from 'lucide-react';

const NAV = [
  { path: '/admin',                 label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { path: '/admin/produtos',        label: 'Produtos',      icon: Package },
  { path: '/admin/pedidos',         label: 'Pedidos',       icon: ShoppingBag },
  { path: '/admin/vendedores',      label: 'vendedores',    icon: Users },
  { path: '/admin/configuracoes',   label: 'Configurações', icon: Settings },
];

export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const location   = useLocation();
  const [open, setOpen] = useState(false);

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
          <Link to="/" className="flex items-center gap-2.5 group">
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

          <Link
            to="/"
            className="ml-auto flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors font-medium"
          >
            <Store className="h-4 w-4" />
            Ver loja
          </Link>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
