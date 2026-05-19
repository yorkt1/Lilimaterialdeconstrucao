/**
 * api.js — Camada de API do projeto Lili Materiais de Construção
 *
 * Integração real com Supabase. Mantém a mesma interface pública que o
 * código restante do app espera (api.auth.*, api.entities.*, api.integrations.*).
 *
 * Tabelas esperadas no Supabase:
 *   - products      (id uuid PK, name, price, category, brand, in_stock, featured, image_url, description, created_at)
 *   - cart_items    (id uuid PK, user_id, product_id, quantity, created_at)
 *   - categories    (id uuid PK, name, slug, created_at)
 *   - banners       (id uuid PK, title, image_url, link_url, active, created_at)
 *   - orders        (id uuid PK, user_id, items jsonb, total, status, created_at)
 */

import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Utilitário — factory de CRUD genérico para uma tabela Supabase
// ---------------------------------------------------------------------------
const createEntityApi = (tableName) => {
  return {
    /**
     * Lista todos os registros, com suporte a sort e limit.
     * @param {{ column: string, order: 'asc'|'desc' }} [sort]
     * @param {number} [limit]
     */
    list: async (sort, limit) => {
      let query = supabase.from(tableName).select('*');

      if (sort?.column) {
        query = query.order(sort.column, { ascending: sort.order !== 'desc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },

    /**
     * Filtra registros por um objeto de critérios (igualdade exata).
     * @param {Record<string, unknown>} criteria
     * @param {{ column: string, order: 'asc'|'desc' }} [sort]
     * @param {number} [limit]
     */
    filter: async (criteria, sort, limit) => {
      let query = supabase.from(tableName).select('*');

      for (const [key, value] of Object.entries(criteria)) {
        query = query.eq(key, value);
      }

      if (sort?.column) {
        query = query.order(sort.column, { ascending: sort.order !== 'desc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },

    /**
     * Cria um novo registro.
     * @param {Record<string, unknown>} data
     */
    create: async (data) => {
      const { data: created, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return created;
    },

    /**
     * Atualiza um registro pelo id.
     * @param {string} id
     * @param {Record<string, unknown>} data
     */
    update: async (id, data) => {
      const { data: updated, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },

    /**
     * Remove um registro pelo id.
     * @param {string} id
     */
    delete: async (id) => {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  };
};

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------
export const api = {
  // ── Autenticação ──────────────────────────────────────────────────────────
  auth: {
    /**
     * Login com e-mail e senha.
     */
    loginViaEmailPassword: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },

    /**
     * Cadastro de novo usuário.
     */
    register: async ({ email, password, full_name }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name } },
      });
      if (error) throw error;
      return data;
    },

    /**
     * Login com provedor OAuth (Google, GitHub, etc.).
     */
    loginWithProvider: async (provider, redirectUrl) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectUrl ?? window.location.origin },
      });
      if (error) throw error;
    },

    /**
     * Retorna a sessão ativa atual.
     */
    getSession: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },

    /**
     * Escuta mudanças de estado de autenticação.
     * Retorna o mesmo formato que o AuthContext espera:
     *   { data: { subscription: { unsubscribe } } }
     */
    onAuthStateChange: (callback) => {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });
      return { data };
    },

    /**
     * Encerra a sessão atual.
     */
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    /**
     * Solicita e-mail de redefinição de senha.
     */
    resetPasswordRequest: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { success: true };
    },

    /**
     * Redefine a senha usando o token do link enviado por e-mail.
     */
    resetPassword: async (newPassword) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    },

    /**
     * Define o token manualmente (usado em fluxos de callback OAuth).
     */
    setToken: async (access_token, refresh_token) => {
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }
    },

    /**
     * Verifica OTP (One-Time Password).
     */
    verifyOtp: async ({ email, token, type = 'email' }) => {
      const { data, error } = await supabase.auth.verifyOtp({ email, token, type });
      if (error) throw error;
      return data;
    },
  },

  // ── Entidades (CRUD) ──────────────────────────────────────────────────────
  entities: {
    Product: createEntityApi('produtos'),
    CartItem: createEntityApi('cart_items'),
    Category: createEntityApi('categories'),
    Banner: createEntityApi('banners'),
    Order: createEntityApi('orders'),
    Vendedor: createEntityApi('vendedores'),
  },

  // ── Integrações ───────────────────────────────────────────────────────────
  integrations: {
    Core: {
      /**
       * Faz upload de um arquivo para o Storage do Supabase (bucket "uploads").
       * Retorna a URL pública do arquivo.
       */
      UploadFile: async ({ file }) => {
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath);

        return { file_url: urlData.publicUrl };
      },
    },
  },
};
