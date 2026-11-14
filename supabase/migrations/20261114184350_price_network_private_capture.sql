-- Undeployed proposal: atomic, service-only capture using existing immutable rows.
-- No client table grants/policies change, and no receipt/personal data is added.
begin;
create function public.price_network_capture_row(
  p_row_id uuid, p_store_id uuid, p_product jsonb, p_existing_product_id uuid, p_observation jsonb, p_replay_only boolean default false
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  product public.price_network_products;
  observation public.price_network_observations;
  prior public.price_network_observations;
  chosen uuid;
  action text := 'reused';
  expected jsonb;
begin
  -- Service-role EXECUTE only, plus external server-side verified maintainer ID.
  -- Row UUID is the permanent observation ID: retries serialize on the same key.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_row_id::text, 0));
  if jsonb_typeof(p_product) <> 'object' or jsonb_typeof(p_observation) <> 'object' then raise exception 'Invalid capture payload'; end if;
  expected := to_jsonb(jsonb_populate_record(null::public.price_network_observations, p_observation || jsonb_build_object('store_id', p_store_id))) - array['id','product_id','created_at'];
  select * into prior from public.price_network_observations where id = p_row_id;
  if found then
    select * into product from public.price_network_products where id = prior.product_id;
    if (to_jsonb(product) - array['id','created_at','updated_at']) <> p_product
      or (to_jsonb(prior) - array['id','product_id','created_at']) <> expected
      or (p_existing_product_id is not null and p_existing_product_id <> prior.product_id) then
      raise exception 'Idempotency conflict: row ID already used for different content';
    end if;
    return jsonb_build_object('status','replayed','productId',prior.product_id,'observationId',prior.id,'productAction','reused');
  end if;
  if p_replay_only then raise exception 'Expired request has no saved observation to replay'; end if;
  perform 1 from public.price_network_stores where id = p_store_id and active;
  if not found then raise exception 'Inactive or unknown store'; end if;
  -- Serialize exact identities across different row IDs to avoid capture-created
  -- duplicates. Hash collisions only serialize extra work; they never merge data.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_product::text, 1));
  if p_existing_product_id is not null then
    select * into product from public.price_network_products where id = p_existing_product_id;
    if not found or (to_jsonb(product) - array['id','created_at','updated_at']) <> p_product then raise exception 'Existing product specification differs'; end if;
    chosen := product.id;
  else
    select id into chosen from public.price_network_products
      where (to_jsonb(price_network_products) - array['id','created_at','updated_at']) = p_product order by id limit 1;
    if chosen is null then
      product := jsonb_populate_record(null::public.price_network_products, p_product);
      insert into public.price_network_products
        (normalized_name,brand,gtin,canonical_ingredient_id,grocery_search_name,product_form_key,form_verified,package_kind,content_basis,package_quantity,package_unit,pack_count)
        values (product.normalized_name,product.brand,product.gtin,product.canonical_ingredient_id,product.grocery_search_name,product.product_form_key,product.form_verified,product.package_kind,product.content_basis,product.package_quantity,product.package_unit,product.pack_count)
        returning id into chosen;
      action := 'created';
    end if;
  end if;
  observation := jsonb_populate_record(null::public.price_network_observations, p_observation);
  if observation.regular_price_minor is null and observation.sale_price_minor is null then raise exception 'Price required'; end if;
  if observation.conditions <> '[]'::jsonb and observation.conditions <> '[{"kind":"membership","eligibility":"unknown"}]'::jsonb then raise exception 'Unsupported capture condition'; end if;
  insert into public.price_network_observations
    (id,store_id,product_id,regular_price_minor,sale_price_minor,currency,channel,selling_basis,selling_quantity,selling_unit,observed_at,expires_at,sale_expires_at,availability,source_type,source_confidence,conditions)
    values (p_row_id,p_store_id,chosen,observation.regular_price_minor,observation.sale_price_minor,observation.currency,observation.channel,observation.selling_basis,observation.selling_quantity,observation.selling_unit,observation.observed_at,observation.expires_at,observation.sale_expires_at,observation.availability,observation.source_type,observation.source_confidence,observation.conditions);
  return jsonb_build_object('status','saved','productId',chosen,'observationId',p_row_id,'productAction',action);
end;
$$;
revoke all on function public.price_network_capture_row(uuid,uuid,jsonb,uuid,jsonb,boolean) from public, anon, authenticated;
grant execute on function public.price_network_capture_row(uuid,uuid,jsonb,uuid,jsonb,boolean) to service_role;
grant select on public.price_network_stores to service_role;
grant select, insert on public.price_network_products, public.price_network_observations to service_role;
comment on function public.price_network_capture_row(uuid,uuid,jsonb,uuid,jsonb,boolean) is 'Service-only atomic capture. Server must verify allowlisted maintainer and validate rows; row UUID is immutable idempotency key. No client writes.';
commit;
