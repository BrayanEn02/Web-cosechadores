-- Esquema de base de datos para gestión de cosecheros de café

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (extendiendo auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'supervisor', 'usuario')) DEFAULT 'usuario',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de cosecheros
CREATE TABLE IF NOT EXISTS public.cosecheros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  documento TEXT NOT NULL UNIQUE,
  telefono TEXT NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('activo', 'inactivo')) DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de lotes
CREATE TABLE IF NOT EXISTS public.lotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  hectareas NUMERIC(10, 2) NOT NULL CHECK (hectareas > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pesajes
CREATE TABLE IF NOT EXISTS public.pesajes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cosechero_id UUID NOT NULL REFERENCES public.cosecheros(id) ON DELETE CASCADE,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE SET NULL,
  kilos_bruto NUMERIC(10, 2) NOT NULL CHECK (kilos_bruto >= 0),
  descuento NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (descuento >= 0),
  kilos_neto NUMERIC(10, 2) NOT NULL CHECK (kilos_neto >= 0),
  precio_kilo NUMERIC(10, 2) NOT NULL CHECK (precio_kilo >= 0),
  total_pagar NUMERIC(10, 2) NOT NULL CHECK (total_pagar >= 0),
  fecha_pesaje TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de adelantos de saldo
CREATE TABLE IF NOT EXISTS public.adelantos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cosechero_id UUID NOT NULL REFERENCES public.cosecheros(id) ON DELETE CASCADE,
  monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
  fecha_adelanto TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nota TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS public.pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cosechero_id UUID NOT NULL REFERENCES public.cosecheros(id) ON DELETE CASCADE,
  monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
  fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nota TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cosecheros_documento ON public.cosecheros(documento);
CREATE INDEX IF NOT EXISTS idx_cosecheros_estado ON public.cosecheros(estado);
CREATE INDEX IF NOT EXISTS idx_pesajes_cosechero_id ON public.pesajes(cosechero_id);
CREATE INDEX IF NOT EXISTS idx_pesajes_lote_id ON public.pesajes(lote_id);
CREATE INDEX IF NOT EXISTS idx_pesajes_fecha ON public.pesajes(fecha_pesaje);
CREATE INDEX IF NOT EXISTS idx_adelantos_cosechero_id ON public.adelantos(cosechero_id);
CREATE INDEX IF NOT EXISTS idx_adelantos_fecha ON public.adelantos(fecha_adelanto);
CREATE INDEX IF NOT EXISTS idx_pagos_cosechero_id ON public.pagos(cosechero_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON public.pagos(fecha_pago);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cosecheros_updated_at
  BEFORE UPDATE ON public.cosecheros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lotes_updated_at
  BEFORE UPDATE ON public.lotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosecheros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adelantos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuarios
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.usuarios FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.usuarios FOR UPDATE
  USING (auth.uid() = id);

-- Políticas RLS para cosecheros (todos los usuarios autenticados pueden ver y crear)
CREATE POLICY "Usuarios autenticados pueden ver cosecheros"
  ON public.cosecheros FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear cosecheros"
  ON public.cosecheros FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar cosecheros"
  ON public.cosecheros FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar cosecheros"
  ON public.cosecheros FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para lotes
CREATE POLICY "Usuarios autenticados pueden ver lotes"
  ON public.lotes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear lotes"
  ON public.lotes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar lotes"
  ON public.lotes FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar lotes"
  ON public.lotes FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para pesajes
CREATE POLICY "Usuarios autenticados pueden ver pesajes"
  ON public.pesajes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear pesajes"
  ON public.pesajes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar pesajes"
  ON public.pesajes FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar pesajes"
  ON public.pesajes FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para adelantos
CREATE POLICY "Usuarios autenticados pueden ver adelantos"
  ON public.adelantos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear adelantos"
  ON public.adelantos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar adelantos"
  ON public.adelantos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar adelantos"
  ON public.adelantos FOR DELETE
  TO authenticated
  USING (true);

-- RLS para pagos
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver pagos"
  ON public.pagos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear pagos"
  ON public.pagos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar pagos"
  ON public.pagos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar pagos"
  ON public.pagos FOR DELETE
  TO authenticated
  USING (true);

-- Vista para reportes de pesajes con información del cosechero
CREATE OR REPLACE VIEW public.vista_pesajes_completa AS
SELECT
  p.id,
  p.cosechero_id,
  c.nombre AS cosechero_nombre,
  c.documento AS cosechero_documento,
  p.lote_id,
  l.nombre AS lote_nombre,
  p.kilos_bruto,
  p.descuento,
  p.kilos_neto,
  p.precio_kilo,
  p.total_pagar,
  p.fecha_pesaje,
  p.created_at
FROM public.pesajes p
INNER JOIN public.cosecheros c ON p.cosechero_id = c.id
LEFT JOIN public.lotes l ON p.lote_id = l.id
ORDER BY p.fecha_pesaje DESC;

-- Datos de ejemplo (opcional - comentado por defecto)
-- INSERT INTO public.cosecheros (nombre, documento, telefono, estado) VALUES
--   ('Juan Pérez', '1234567890', '3001234567', 'activo'),
--   ('María González', '0987654321', '3109876543', 'activo'),
--   ('Carlos Rodríguez', '1122334455', '3201122334', 'inactivo');

-- INSERT INTO public.lotes (nombre, descripcion, hectareas) VALUES
--   ('Lote A', 'Lote principal con variedad caturra', 5.5),
--   ('Lote B', 'Lote secundario con variedad castillo', 3.2),
--   ('Lote C', 'Lote experimental', 1.8);
