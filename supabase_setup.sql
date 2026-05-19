-- ============================================================
-- LILI MATERIAIS DE CONSTRUÇÃO — Setup Supabase
-- Execute este script no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/rzeqeqrgdmhofmrcphqh/sql
-- ============================================================

-- ── 1. Extensões ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 2. Tabela: products ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  description      TEXT,
  price            NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price   NUMERIC(10,2),
  category         TEXT,
  brand            TEXT,
  image_url        TEXT,
  secondary_image_url TEXT,
  in_stock         BOOLEAN NOT NULL DEFAULT true,
  featured         BOOLEAN NOT NULL DEFAULT false,
  rating           NUMERIC(3,1),
  review_count     INTEGER DEFAULT 0,
  tags             TEXT[],
  specs            JSONB DEFAULT '{}'::JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category);
CREATE INDEX IF NOT EXISTS products_featured_idx ON public.products (featured);
CREATE INDEX IF NOT EXISTS products_in_stock_idx ON public.products (in_stock);

-- ── 3. Tabela: cart_items ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cart_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name  TEXT,
  product_image TEXT,
  price         NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity      INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cart_items_user_id_idx ON public.cart_items (user_id);

-- ── 4. Tabela: categories ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  icon       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. Tabela: banners ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banners (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  subtitle    TEXT,
  cta         TEXT DEFAULT 'Explorar',
  category    TEXT,
  image_url   TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS banners_sort_order_idx ON public.banners (sort_order);

-- ── 6. Tabela: orders ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  items      JSONB NOT NULL DEFAULT '[]'::JSONB,
  total      NUMERIC(10,2) NOT NULL DEFAULT 0,
  status     TEXT NOT NULL DEFAULT 'pending',
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx  ON public.orders (status);

-- ── 7. Trigger updated_at automático ────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 8. Row Level Security (RLS) ──────────────────────────────

-- products — públicos para leitura, somente autenticados gerenciam
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products are public" ON public.products;
CREATE POLICY "Products are public" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can manage products" ON public.products;
CREATE POLICY "Authenticated can manage products" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');

-- banners — públicos para leitura
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Banners are public" ON public.banners;
CREATE POLICY "Banners are public" ON public.banners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can manage banners" ON public.banners;
CREATE POLICY "Authenticated can manage banners" ON public.banners
  FOR ALL USING (auth.role() = 'authenticated');

-- categories — públicas para leitura
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories are public" ON public.categories;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can manage categories" ON public.categories;
CREATE POLICY "Authenticated can manage categories" ON public.categories
  FOR ALL USING (auth.role() = 'authenticated');

-- cart_items — cada usuário vê e edita apenas os seus
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own cart" ON public.cart_items;
CREATE POLICY "Users manage own cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- orders — cada usuário vê os seus; admins veem todos (via service role)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own orders" ON public.orders;
CREATE POLICY "Users manage own orders" ON public.orders
  FOR ALL USING (auth.uid() = user_id);

-- ── 9. Storage bucket "uploads" ──────────────────────────────
-- Crie manualmente no painel: Storage → New Bucket → "uploads" → Public
-- Ou execute se a extensão de storage estiver disponível:
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read uploads" ON storage.objects;
CREATE POLICY "Public read uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Auth upload" ON storage.objects;
CREATE POLICY "Auth upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- ── 10. Dados Iniciais: Produtos ─────────────────────────────
INSERT INTO public.products (name, description, price, category, brand, in_stock, featured, image_url)
VALUES
  ('Cimento Votorantim 50kg', 'Cimento de alta qualidade para obras de todos os portes.', 35.90, 'materiais_construcao', 'Votorantim', true, true, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop'),
  ('Tijolo Baiano 8 Furos', 'Tijolo cerâmico ideal para alvenaria de vedação.', 1.20, 'materiais_construcao', 'Cerâmica Local', true, false, 'https://images.unsplash.com/photo-1589939705384-5185138a0470?q=80&w=800&auto=format&fit=crop'),
  ('Porcelanato Polido 60x60', 'Porcelanato brilhante de alta durabilidade e elegância.', 79.90, 'pisos_revestimentos', 'Eliane', true, true, 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=800&auto=format&fit=crop'),
  ('Tinta Acrílica Branca 18L', 'Tinta de alto rendimento para pintura de interiores e exteriores.', 250.00, 'tintas_acessorios', 'Suvinil', true, true, 'https://images.unsplash.com/photo-1560767813-f77652bb90bd?q=80&w=800&auto=format&fit=crop'),
  ('Furadeira de Impacto 600W', 'Furadeira profissional potente para diversos materiais.', 289.00, 'ferramentas', 'Bosch', true, true, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800&auto=format&fit=crop'),
  ('Chuveiro Elétrico Acqua Duo', 'Ducha sofisticada com jato multidirecional.', 189.90, 'banheiro', 'Lorenzetti', true, true, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop'),
  ('Kit Lâmpada LED 9W (10 un)', 'Economia e durabilidade com tecnologia LED de ponta.', 89.00, 'iluminacao', 'Philips', true, true, 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=800&auto=format&fit=crop')
ON CONFLICT DO NOTHING;

-- ── 11. Dados Iniciais: Banners ───────────────────────────────
INSERT INTO public.banners (title, subtitle, cta, category, image_url, active, sort_order)
VALUES
  ('Materiais de Construção', 'Tudo para sua obra com qualidade e preço justo', 'Ver Produtos', 'materiais_construcao', '', true, 0),
  ('Pisos e Revestimentos', 'Porcelanatos e cerâmicas para todos os ambientes', 'Explorar', 'pisos_revestimentos', '', true, 1),
  ('Ferramentas Profissionais', 'As melhores marcas para quem constrói com precisão', 'Ver Ferramentas', 'ferramentas', '', true, 2)
ON CONFLICT DO NOTHING;

-- ── Fim do script ─────────────────────────────────────────────
SELECT 'Setup concluído!' AS status;
