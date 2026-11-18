-- =====================================================================
-- MotoKoi: bucket de fotos dos produtos (Supabase Storage)
-- Leitura pública pela URL; só admin envia, troca ou apaga arquivos.
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy produtos_fotos_admin_enviar on storage.objects
  for insert to authenticated
  with check (bucket_id = 'produtos' and (select private.eh_admin()));

create policy produtos_fotos_admin_trocar on storage.objects
  for update to authenticated
  using (bucket_id = 'produtos' and (select private.eh_admin()))
  with check (bucket_id = 'produtos' and (select private.eh_admin()));

create policy produtos_fotos_admin_apagar on storage.objects
  for delete to authenticated
  using (bucket_id = 'produtos' and (select private.eh_admin()));

-- Listar arquivos do bucket (o painel usa); o site usa a URL pública e não precisa disto
create policy produtos_fotos_admin_listar on storage.objects
  for select to authenticated
  using (bucket_id = 'produtos' and (select private.eh_admin()));
