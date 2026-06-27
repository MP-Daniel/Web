create table if not exists public.products (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  category text not null,
  price integer not null check (price >= 0),
  short_description text not null,
  long_description text not null,
  accent text not null default 'rose',
  tag text not null default 'Nuevo',
  popularity integer not null default 0 check (popularity >= 0 and popularity <= 100),
  variant text,
  benefits text[] not null default '{}',
  ingredients text[] not null default '{}',
  visual_style text,
  visual_label text,
  visual_note text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  name text not null,
  shade text,
  sku text unique,
  price integer,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id bigint generated always as identity primary key,
  variant_id bigint not null unique references public.product_variants(id) on delete cascade,
  stock integer not null default 0 check (stock >= 0),
  reserved_stock integer not null default 0 check (reserved_stock >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending_whatsapp',
  channel text not null default 'whatsapp',
  customer_name text,
  customer_phone text,
  customer_notes text,
  total_amount integer not null default 0 check (total_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id bigint not null references public.products(id),
  variant_id bigint references public.product_variants(id),
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  line_total integer not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category);
create index if not exists products_is_active_idx on public.products(is_active);
create index if not exists product_variants_product_id_idx on public.product_variants(product_id);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read active variants" on public.product_variants;
create policy "Public can read active variants"
on public.product_variants
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = product_variants.product_id
      and products.is_active = true
  )
);

drop policy if exists "Public can read inventory for active products" on public.inventory;
create policy "Public can read inventory for active products"
on public.inventory
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.product_variants
    join public.products on products.id = product_variants.product_id
    where product_variants.id = inventory.variant_id
      and products.is_active = true
  )
);

-- Orders are intentionally not readable or writable by anon users.
-- The backend writes orders using the service role key stored only in .env.
