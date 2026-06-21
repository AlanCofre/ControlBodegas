-- ==========================================
-- SCRIPT DE CONFIGURACIÓN DE SUPABASE AUTH
-- Ejecutar este script en el SQL Editor de Supabase
-- ==========================================

-- 1. Agregar restricciones UNIQUE si no existen para asegurar el correcto funcionamiento del trigger
ALTER TABLE public.usuarios 
  ADD CONSTRAINT usuarios_email_key UNIQUE (email);

ALTER TABLE public.usuarios 
  ADD CONSTRAINT usuarios_auth_user_id_key UNIQUE (auth_user_id);

-- 2. Crear la función del trigger para vincular usuarios creados en Auth con perfiles públicos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_rol_id integer;
BEGIN
  -- Buscar el rol_id para 'operador_bodega' por defecto
  SELECT id INTO default_rol_id FROM public.roles WHERE nombre = 'operador_bodega' LIMIT 1;
  IF default_rol_id IS NULL THEN
    default_rol_id := 3; -- Fallback en caso de que no lo encuentre
  END IF;

  INSERT INTO public.usuarios (auth_user_id, nombre, email, rol_id, bodega_id, activo)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'rol_id')::integer, default_rol_id),
    (new.raw_user_meta_data->>'bodega_id')::integer,
    true
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    auth_user_id = new.id,
    nombre = coalesce(new.raw_user_meta_data->>'nombre', public.usuarios.nombre),
    rol_id = coalesce((new.raw_user_meta_data->>'rol_id')::integer, public.usuarios.rol_id),
    bodega_id = coalesce((new.raw_user_meta_data->>'bodega_id')::integer, public.usuarios.bodega_id),
    activo = true;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear el trigger para enlazar la tabla auth.users con public.usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
