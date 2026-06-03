# Configuración de Supabase para Gestión de Cosecheros

## Paso 1: Configurar la Base de Datos

1. Ve a tu proyecto de Supabase: https://app.supabase.com/project/medorydgcjnfhrggvred

2. En el panel lateral, haz clic en **SQL Editor**

3. Copia todo el contenido del archivo `schema.sql` y pégalo en el editor SQL

4. Haz clic en **Run** para ejecutar el script y crear todas las tablas

## Paso 2: Obtener las Credenciales

1. Ve a **Project Settings** → **API**

2. Copia los siguientes valores:
   - **Project URL**: `https://medorydgcjnfhrggvred.supabase.co`
   - **anon/public key**: (una clave larga que empieza con `eyJ...`)

## Paso 3: Configurar las Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto (copia desde `.env.example`):

```bash
cp .env.example .env
```

2. Edita el archivo `.env` y reemplaza `tu-anon-key-aqui` con tu clave real:

```env
VITE_SUPABASE_URL=https://medorydgcjnfhrggvred.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Paso 4: Configurar la Autenticación

1. En Supabase, ve a **Authentication** → **Providers**

2. Asegúrate de que **Email** esté habilitado

3. En **Authentication** → **URL Configuration**, configura:
   - **Site URL**: La URL de tu aplicación (en desarrollo: `http://localhost:5173`)

## Paso 5: Crear el Primer Usuario

### Opción A: Desde Supabase Dashboard

1. Ve a **Authentication** → **Users**
2. Haz clic en **Add user**
3. Ingresa un email y contraseña
4. Luego, ve a **SQL Editor** y ejecuta:

```sql
INSERT INTO public.usuarios (id, email, nombre, rol)
VALUES (
  '[UUID-del-usuario-creado]',
  'admin@ejemplo.com',
  'Administrador',
  'admin'
);
```

### Opción B: Desde la Aplicación

La aplicación incluirá una funcionalidad de registro que creará automáticamente el usuario en ambas tablas (auth.users y public.usuarios).

## Estructura de Tablas Creadas

### `usuarios`
- Extiende la tabla de autenticación de Supabase
- Campos: id, email, nombre, rol (admin/supervisor/usuario)

### `cosecheros`
- Almacena información de los cosecheros
- Campos: id, nombre, documento, telefono, estado (activo/inactivo)

### `lotes`
- Almacena información de los lotes de café
- Campos: id, nombre, descripcion, hectareas

### `pesajes`
- Registra cada pesaje realizado
- Campos: id, cosechero_id, lote_id, kilos_bruto, descuento, kilos_neto, precio_kilo, total_pagar, fecha_pesaje
- Relaciones: cosechero_id → cosecheros.id, lote_id → lotes.id

## Seguridad (Row Level Security)

El esquema incluye políticas RLS que:
- Permiten a usuarios autenticados leer y modificar todos los registros
- Los usuarios pueden ver y editar su propio perfil
- Solo usuarios autenticados pueden acceder a los datos

Si necesitas políticas más restrictivas (ej: solo admins pueden eliminar), modifica las políticas en el SQL Editor.

## Verificar la Instalación

Para verificar que todo está configurado correctamente:

1. Reinicia el servidor de desarrollo
2. Intenta hacer login en la aplicación
3. Verifica que puedes crear cosecheros, lotes y pesajes
4. Comprueba en Supabase → **Table Editor** que los datos se están guardando

## Datos de Ejemplo (Opcional)

Si quieres poblar la base de datos con datos de ejemplo, descomenta las líneas al final del archivo `schema.sql` antes de ejecutarlo:

```sql
INSERT INTO public.cosecheros (nombre, documento, telefono, estado) VALUES
  ('Juan Pérez', '1234567890', '3001234567', 'activo'),
  ('María González', '0987654321', '3109876543', 'activo'),
  ('Carlos Rodríguez', '1122334455', '3201122334', 'inactivo');

INSERT INTO public.lotes (nombre, descripcion, hectareas) VALUES
  ('Lote A', 'Lote principal con variedad caturra', 5.5),
  ('Lote B', 'Lote secundario con variedad castillo', 3.2),
  ('Lote C', 'Lote experimental', 1.8);
```

## Solución de Problemas

### Error: "Invalid API key"
- Verifica que copiaste correctamente la clave en `.env`
- Asegúrate de que el archivo `.env` está en la raíz del proyecto
- Reinicia el servidor de desarrollo

### Error: "relation does not exist"
- Asegúrate de haber ejecutado el script `schema.sql` completamente
- Verifica en **Table Editor** que las tablas se crearon correctamente

### Error: "row level security policy"
- Verifica que el usuario esté autenticado
- Revisa las políticas RLS en el SQL Editor

## Próximos Pasos

Una vez configurada la base de datos:
1. Los componentes de la aplicación se actualizarán para usar los servicios de Supabase
2. El login usará autenticación real
3. Todos los datos se persistirán en la base de datos
4. Podrás acceder a reportes y estadísticas en tiempo real
