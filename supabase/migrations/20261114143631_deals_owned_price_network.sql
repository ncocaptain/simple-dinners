-- Repository-only Phase 5A proposal. Do not apply to production without review.
begin;

create table public.price_network_stores (
  id uuid primary key default gen_random_uuid(),
  retailer_name text not null check (length(trim(retailer_name)) between 1 and 200),
  store_name text check (length(store_name) <= 200),
  store_number text check (length(store_number) <= 100),
  city text check (length(city) <= 100),
  state text check (length(state) <= 100),
  postal_code text check (length(postal_code) <= 20),
  retailer_store_id text check (length(retailer_store_id) <= 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.price_network_products (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null check (length(trim(normalized_name)) between 1 and 500),
  brand text check (length(brand) <= 200),
  gtin text check (gtin ~ '^([0-9]{8}|[0-9]{12}|[0-9]{13}|[0-9]{14})$'),
  -- Existing application ingredient registry IDs, not a second ingredient catalog.
  canonical_ingredient_id text check (length(trim(canonical_ingredient_id)) between 1 and 200),
  grocery_search_name text not null check (length(trim(grocery_search_name)) between 1 and 500),
  product_form_key text not null check (length(trim(product_form_key)) between 1 and 500),
  form_verified boolean not null default false,
  package_kind text not null check (package_kind in ('single','multipack','variable-weight')),
  content_basis text not null check (content_basis in ('net','drained','count','unknown')),
  package_quantity double precision,
  package_unit text check (length(trim(package_unit)) between 1 and 100),
  pack_count integer check (pack_count > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (package_quantity > 0 and package_quantity < 'Infinity'::float8),
  check ((package_quantity is null) = (package_unit is null)),
  check (package_kind = 'multipack' or pack_count is null),
  check (package_kind <> 'variable-weight' or (package_quantity is null and pack_count is null))
);

create table public.price_network_observations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.price_network_stores(id) on delete restrict,
  product_id uuid not null references public.price_network_products(id) on delete restrict,
  regular_price_minor bigint check (regular_price_minor between 0 and 9007199254740991),
  sale_price_minor bigint check (sale_price_minor between 0 and 9007199254740991),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  channel text not null default 'in-store' check (channel in ('in-store','pickup','delivery')),
  selling_basis text not null check (selling_basis in ('package','measure')),
  selling_quantity double precision,
  selling_unit text check (length(trim(selling_unit)) between 1 and 100),
  observed_at timestamptz not null check (isfinite(observed_at)),
  expires_at timestamptz check (isfinite(expires_at) and expires_at > observed_at),
  sale_expires_at timestamptz check (isfinite(sale_expires_at) and sale_expires_at > observed_at),
  source_type text not null check (source_type in ('manual','receipt-confirmed','user-contributed','approved-feed')),
  source_confidence text not null default 'unverified' check (source_confidence in ('verified','unverified')),
  availability text not null default 'unknown' check (availability in ('in-stock','out-of-stock','unknown')),
  -- Small allowlisted conditions, never raw provider payloads. Adapter validates
  -- individual condition shapes before they can reach comparison math.
  conditions jsonb not null default '[]'::jsonb check (jsonb_typeof(conditions) = 'array' and pg_column_size(conditions) <= 4096),
  created_at timestamptz not null default now(),
  check ((selling_basis = 'package' and selling_quantity is null and selling_unit is null)
    or (selling_basis = 'measure' and selling_quantity is not null and selling_unit is not null
      and selling_quantity > 0 and selling_quantity < 'Infinity'::float8)),
  check (sale_price_minor is not null or (sale_expires_at is null and conditions = '[]'::jsonb))
);

-- Product IDs identify an immutable package/form specification. New package sizes
-- require new IDs; otherwise historical prices would silently change meaning.
create function public.price_network_guard_product() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if (to_jsonb(new) - 'updated_at') is distinct from (to_jsonb(old) - 'updated_at') then
    raise exception 'Price Network product specifications are immutable; create a new product ID';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger price_network_product_guard before update on public.price_network_products
for each row execute function public.price_network_guard_product();

create function public.price_network_touch_store() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger price_network_store_timestamp before update on public.price_network_stores
for each row execute function public.price_network_touch_store();

-- Append-only observations preserve price history, including explicit null prices.
create function public.price_network_preserve_history() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  raise exception 'Price observations are append-only; insert a new observation';
end;
$$;
create trigger price_network_history_guard before update or delete on public.price_network_observations
for each row execute function public.price_network_preserve_history();
revoke all on function public.price_network_guard_product(), public.price_network_touch_store(), public.price_network_preserve_history() from public, anon, authenticated;

-- Shared curated public catalog only; never receipt/user identity or private data.
-- SQL administrators are the only writers in this phase. No client write policies.
alter table public.price_network_stores enable row level security;
alter table public.price_network_products enable row level security;
alter table public.price_network_observations enable row level security;
revoke all on public.price_network_stores, public.price_network_products, public.price_network_observations from public, anon, authenticated;
grant select on public.price_network_stores, public.price_network_products, public.price_network_observations to anon, authenticated;
create policy price_network_stores_read on public.price_network_stores for select to anon, authenticated using (active);
create policy price_network_products_read on public.price_network_products for select to anon, authenticated using (true);
create policy price_network_observations_read on public.price_network_observations for select to anon, authenticated
  using (exists (select 1 from public.price_network_stores s where s.id = store_id and s.active));

create index price_network_products_ingredient_idx on public.price_network_products (canonical_ingredient_id) where canonical_ingredient_id is not null;
-- Covers product/store lookups and multi-product reads with newest-first history.
create index price_network_observations_recent_idx on public.price_network_observations
  (store_id, product_id, currency, channel, observed_at desc, id desc);
-- Support the product foreign key and ingredient -> product -> observation reads.
create index price_network_observations_product_idx on public.price_network_observations (product_id);

comment on table public.price_network_observations is 'Curated shared append-only price history. No app writes. Null means missing price, never zero. No personal provenance.';
comment on column public.price_network_products.form_verified is 'Administrator-confirmed exact grocery search wording and product form/preparation identity; canonical ID alone is insufficient.';
comment on column public.price_network_observations.expires_at is 'Optional source expiry; adapter additionally enforces a 24-hour maximum age.';
commit;
