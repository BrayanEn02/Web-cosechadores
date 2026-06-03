-- Migración: Protección de datos personales (Ley 1581 de 2012)
ALTER TABLE public.cosecheros
  ADD COLUMN IF NOT EXISTS acepta_tratamiento_datos BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS fecha_aceptacion TIMESTAMP WITH TIME ZONE;
