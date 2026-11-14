-- Disposable LOCAL Postgres only, after Phase 5A + private capture migrations.
begin;
insert into public.price_network_stores (id,retailer_name) values ('10000000-0000-4000-8000-000000000001','Fictional capture SQL store');
insert into public.price_network_stores (id,retailer_name,active) values ('10000000-0000-4000-8000-000000000002','Fictional inactive store',false);
set local role service_role;
do $$
declare
 p jsonb := '{"normalized_name":"Fictional capture rice","brand":null,"gtin":null,"canonical_ingredient_id":"rice","grocery_search_name":"rice","product_form_key":"dry-rice","form_verified":true,"package_kind":"single","content_basis":"net","package_quantity":500,"package_unit":"g","pack_count":null}';
 o jsonb := jsonb_build_object('regular_price_minor',299,'sale_price_minor',null,'currency','USD','channel','in-store','selling_basis','package','selling_quantity',null,'selling_unit',null,'observed_at',now()-interval '1 hour','expires_at',null,'sale_expires_at',null,'availability','in-stock','source_type','manual','source_confidence','verified','conditions','[]'::jsonb);
 a jsonb; b jsonb; n bigint;
begin
 a := public.price_network_capture_row('10000000-0000-4000-8000-000000000100','10000000-0000-4000-8000-000000000001',p,null,o);
 if a->>'status' <> 'saved' or a->>'productAction' <> 'created' then raise exception 'Initial capture failed'; end if;
 b := public.price_network_capture_row('10000000-0000-4000-8000-000000000100','10000000-0000-4000-8000-000000000001',p,null,o);
 if b->>'status' <> 'replayed' or b->>'productId' <> a->>'productId' then raise exception 'Replay failed'; end if;
 b := public.price_network_capture_row('10000000-0000-4000-8000-000000000101','10000000-0000-4000-8000-000000000001',p,null,o);
 if b->>'productAction' <> 'reused' or b->>'productId' <> a->>'productId' then raise exception 'Exact reuse failed'; end if;
 b := public.price_network_capture_row('10000000-0000-4000-8000-000000000102','10000000-0000-4000-8000-000000000001',p||'{"package_quantity":1000}',null,o);
 if b->>'productId' = a->>'productId' then raise exception 'Different packages merged'; end if;
 begin
  perform public.price_network_capture_row('10000000-0000-4000-8000-000000000100','10000000-0000-4000-8000-000000000001',p,null,o||'{"regular_price_minor":199}');
  raise exception 'Changed replay accepted';
 exception when raise_exception then if sqlerrm not like 'Idempotency conflict:%' then raise; end if; end;
 select count(*) into n from public.price_network_products;
 begin
  perform public.price_network_capture_row('10000000-0000-4000-8000-000000000103','10000000-0000-4000-8000-000000000001',p||'{"normalized_name":"Atomic failure"}',null,o||'{"regular_price_minor":-1}');
  raise exception 'Negative price accepted';
 exception when check_violation then null; end;
 if (select count(*) from public.price_network_products) <> n then raise exception 'Orphan product survived failed observation'; end if;
 begin
  perform public.price_network_capture_row('10000000-0000-4000-8000-000000000104','10000000-0000-4000-8000-000000000001',p||'{"package_quantity":1000}',(a->>'productId')::uuid,o);
  raise exception 'Wrong explicit product accepted';
 exception when raise_exception then if sqlerrm <> 'Existing product specification differs' then raise; end if; end;
 begin
  perform public.price_network_capture_row('10000000-0000-4000-8000-000000000105','10000000-0000-4000-8000-000000000002',p,null,o);
  raise exception 'Inactive store accepted';
 exception when raise_exception then if sqlerrm <> 'Inactive or unknown store' then raise; end if; end;
 if (select count(*) from public.price_network_observations) <> 3 then raise exception 'Duplicate/failed observations persisted'; end if;
 if (select regular_price_minor from public.price_network_observations where id='10000000-0000-4000-8000-000000000100') <> 299 then raise exception 'History changed'; end if;
end;
$$;
reset role;
do $$
begin
 if has_function_privilege('anon','public.price_network_capture_row(uuid,uuid,jsonb,uuid,jsonb,boolean)','execute') or has_function_privilege('authenticated','public.price_network_capture_row(uuid,uuid,jsonb,uuid,jsonb,boolean)','execute') then raise exception 'Client RPC access granted'; end if;
 if has_table_privilege('authenticated','public.price_network_products','insert') or has_table_privilege('anon','public.price_network_observations','insert') then raise exception 'Client writes granted'; end if;
 if (select prosecdef from pg_proc where oid='public.price_network_capture_row(uuid,uuid,jsonb,uuid,jsonb,boolean)'::regprocedure) then raise exception 'Invoker boundary lost'; end if;
end;
$$;
rollback;
