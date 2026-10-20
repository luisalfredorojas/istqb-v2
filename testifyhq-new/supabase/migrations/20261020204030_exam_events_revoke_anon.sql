-- Los privilegios por defecto de Supabase dan a `anon` todo sobre las tablas
-- nuevas de `public`. Al visitante le basta con insertar: sin esto, podría
-- consultar la vista y ver la lista de exámenes con los contadores a cero.
REVOKE ALL ON public.exam_event_stats FROM anon;
REVOKE SELECT, UPDATE, DELETE, TRUNCATE ON public.exam_events FROM anon;
