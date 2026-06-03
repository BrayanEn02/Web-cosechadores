-- Agregar columnas para autenticación de cosecheros
ALTER TABLE public.cosecheros 
ADD COLUMN IF NOT EXISTS password_hash text,
ADD COLUMN IF NOT EXISTS primer_ingreso boolean DEFAULT true;
