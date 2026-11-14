-- Run ONLY in a disposable local Postgres database after the proposed migration.
-- No seed is persisted. Exceptions make psql -v ON_ERROR_STOP=1 fail the check.
begin;
insert into public.price_network_stores (id,retailer_name,active) values
 ('00000000-0000-4000-8000-000000000001','Fictional SQL Market',true),
 ('00000000-0000-4000-8000-000000000002','Fictional Inactive Market',false);
insert into public.price_network_products (id,normalized_name,grocery_search_name,product_form_key,package_kind,content_basis,package_quantity,package_unit)
 values ('00000000-0000-4000-8000-000000000010','Fictional rice','rice','dry-rice','single','net',500,'g');
insert into public.price_network_observations (id,store_id,product_id,regular_price_minor,currency,selling_basis,observed_at,source_type)
 values ('00000000-0000-4000-8000-000000000100','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000010',null,'USD','package',now(),'manual'),
 ('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000010',400,'USD','package',now()-interval '1 hour','manual'),
 ('00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000010',100,'USD','package',now(),'manual');
do $$
begin
 if (select count(*) from pg_class where relname in ('price_network_stores','price_network_products','price_network_observations') and relrowsecurity) <> 3 then raise exception 'RLS missing'; end if;
 if exists (select 1 from pg_policies where tablename like 'price_network_%' and cmd <> 'SELECT') then raise exception 'Write policy found'; end if;
 begin
  update public.price_network_observations set regular_price_minor = 200;
  raise exception 'History changed';
 exception when raise_exception then if sqlerrm <> 'Price observations are append-only; insert a new observation' then raise; end if; end;
 begin
  delete from public.price_network_observations;
  raise exception 'History deleted';
 exception when raise_exception then if sqlerrm <> 'Price observations are append-only; insert a new observation' then raise; end if; end;
 begin
  update public.price_network_products set package_quantity=600;
  raise exception 'Historical package changed';
 exception when raise_exception then if sqlerrm <> 'Price Network product specifications are immutable; create a new product ID' then raise; end if; end;
 begin
  insert into public.price_network_observations (store_id,product_id,regular_price_minor,currency,selling_basis,observed_at,source_type)
   values ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000010',-1,'USD','package',now(),'manual');
  raise exception 'Negative money accepted';
 exception when check_violation then null; end;
 begin
  insert into public.price_network_products (normalized_name,grocery_search_name,product_form_key,package_kind,content_basis,package_quantity,package_unit)
   values ('bad','bad','bad','single','net','NaN'::float8,'g');
  raise exception 'NaN package accepted';
 exception when check_violation then null; end;
 begin
  insert into public.price_network_observations (store_id,product_id,currency,selling_basis,observed_at,expires_at,source_type)
   values ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000010','USD','package',now(),now()-interval '1 second','manual');
  raise exception 'Invalid expiry accepted';
 exception when check_violation then null; end;
 begin
  insert into public.price_network_observations (store_id,product_id,currency,selling_basis,observed_at,source_type)
   values (gen_random_uuid(),'00000000-0000-4000-8000-000000000010','USD','package',now(),'manual');
  raise exception 'Missing store accepted';
 exception when foreign_key_violation then null; end;
end;
$$;
set local role anon;
do $$
begin
 if (select count(*) from public.price_network_stores) <> 1 then raise exception 'Inactive store visible'; end if;
 if (select count(*) from public.price_network_observations) <> 2 then raise exception 'Inactive observation visible or history lost'; end if;
 if (select count(*) from public.price_network_observations where regular_price_minor is null) <> 1 then raise exception 'Null lost'; end if;
 if (select count(*) from public.price_network_products) <> 1 then raise exception 'Product not readable'; end if;
end;
$$;
reset role;
-- ACL checks cover INSERT/UPDATE/DELETE/TRUNCATE, including default grants.
do $$
declare r text; t text; privilege text;
begin
 foreach r in array array['anon','authenticated'] loop
  foreach t in array array['price_network_stores','price_network_products','price_network_observations'] loop
   if not has_table_privilege(r,'public.'||t,'SELECT') then raise exception 'Missing SELECT'; end if;
   foreach privilege in array array['INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'] loop
    if has_table_privilege(r,'public.'||t,privilege) then raise exception 'Unexpected % on % for %',privilege,t,r; end if;
   end loop;
  end loop;
 end loop;
end;
$$;
set local role authenticated;
do $$
begin
 if (select count(*) from public.price_network_observations) <> 2 then raise exception 'Authenticated read failed'; end if;
 begin
  insert into public.price_network_stores (retailer_name) values ('Unauthorized');
  raise exception 'Client insert accepted';
 exception when insufficient_privilege then null; end;
 begin
  update public.price_network_observations set regular_price_minor=0;
  raise exception 'Client update accepted';
 exception when insufficient_privilege then null; end;
 begin
  delete from public.price_network_observations;
  raise exception 'Client delete accepted';
 exception when insufficient_privilege then null; end;
end;
$$;
reset role;
rollback;
