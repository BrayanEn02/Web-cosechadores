-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
-- Crea la tabla adelantos para el sistema de adelantos de saldo

CREATE TABLE IF NOT EXISTS public.adelantos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cosechero_id UUID NOT NULL REFERENCES public.cosecheros(id) ON DELETE CASCADE,
  monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
  fecha_adelanto TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nota TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adelantos_cosechero_id ON public.adelantos(cosechero_id);
CREATE INDEX IF NOT EXISTS idx_adelantos_fecha ON public.adelantos(fecha_adelanto);

ALTER TABLE public.adelantos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios autenticados pueden ver adelantos" ON public.adelantos;
CREATE POLICY "Usuarios autenticados pueden ver adelantos"
  ON public.adelantos FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados pueden crear adelantos" ON public.adelantos;
CREATE POLICY "Usuarios autenticados pueden crear adelantos"
  ON public.adelantos FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar adelantos" ON public.adelantos;
CREATE POLICY "Usuarios autenticados pueden actualizar adelantos"
  ON public.adelantos FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar adelantos" ON public.adelantos;
CREATE POLICY "Usuarios autenticados pueden eliminar adelantos"
  ON public.adelantos FOR DELETE
  TO authenticated
  USING (true);
