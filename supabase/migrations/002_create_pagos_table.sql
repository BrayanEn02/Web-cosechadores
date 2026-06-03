-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
-- Crea la tabla pagos para el sistema de gestión de pagos

CREATE TABLE IF NOT EXISTS public.pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cosechero_id UUID NOT NULL REFERENCES public.cosecheros(id) ON DELETE CASCADE,
  monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
  fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nota TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagos_cosechero_id ON public.pagos(cosechero_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON public.pagos(fecha_pago);

ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios autenticados pueden ver pagos" ON public.pagos;
CREATE POLICY "Usuarios autenticados pueden ver pagos"
  ON public.pagos FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados pueden crear pagos" ON public.pagos;
CREATE POLICY "Usuarios autenticados pueden crear pagos"
  ON public.pagos FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar pagos" ON public.pagos;
CREATE POLICY "Usuarios autenticados pueden actualizar pagos"
  ON public.pagos FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar pagos" ON public.pagos;
CREATE POLICY "Usuarios autenticados pueden eliminar pagos"
  ON public.pagos FOR DELETE
  TO authenticated
  USING (true);
