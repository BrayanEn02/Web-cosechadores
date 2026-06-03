# Configuración del Backend con Supabase

He creado la estructura completa de base de datos y backend para tu aplicación de gestión de cosecheros de café. Aquí están los pasos para completar la configuración:

## 📋 Archivos Creados

### Base de Datos
- `/supabase/schema.sql` - Esquema completo de la base de datos
- `/supabase/README.md` - Guía detallada de configuración

### Servicios (Backend)
- `/src/services/auth.service.ts` - Servicio de autenticación
- `/src/services/cosecheros.service.ts` - Servicio de cosecheros
- `/src/services/lotes.service.ts` - Servicio de lotes
- `/src/services/pesajes.service.ts` - Servicio de pesajes

### Cliente de Supabase
- `/src/utils/supabase/client.ts` - Cliente de Supabase configurado
- `/src/utils/supabase/types.ts` - Tipos TypeScript para la base de datos

### Hooks y Componentes
- `/src/hooks/useAuth.ts` - Hook para manejo de autenticación
- `/src/app/components/ProtectedRoute.tsx` - Componente para proteger rutas

### Configuración
- `.env.example` - Plantilla de variables de entorno

## 🚀 Pasos de Configuración

### 1. Configurar la Base de Datos en Supabase

1. Ve a tu proyecto de Supabase: https://app.supabase.com/project/medorydgcjnfhrggvred

2. En el panel lateral, haz clic en **SQL Editor**

3. Copia todo el contenido del archivo `/supabase/schema.sql`

4. Pégalo en el editor SQL y haz clic en **Run**

Esto creará:
- ✅ Tabla `usuarios` (con perfiles de usuario)
- ✅ Tabla `cosecheros` (gestión de cosecheros)
- ✅ Tabla `lotes` (gestión de lotes de café)
- ✅ Tabla `pesajes` (registro de pesajes)
- ✅ Índices para optimizar consultas
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de seguridad configuradas

### 2. Obtener las Credenciales de Supabase

1. Ve a **Project Settings** → **API**

2. Copia los siguientes valores:
   - **Project URL**: `https://medorydgcjnfhrggvred.supabase.co`
   - **anon/public key**: Una clave larga que empieza con `eyJ...`

### 3. Configurar Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

2. Edita el archivo `.env` y añade tu clave de Supabase:

```env
VITE_SUPABASE_URL=https://medorydgcjnfhrggvred.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tu-clave-aqui...
```

### 4. Habilitar Autenticación por Email

1. En Supabase, ve a **Authentication** → **Providers**

2. Asegúrate de que **Email** esté habilitado

3. En **Email Templates**, puedes personalizar los correos de confirmación (opcional)

### 5. Crear el Primer Usuario

Para crear tu primer usuario administrador, tienes dos opciones:

#### Opción A: Desde el Dashboard de Supabase

1. Ve a **Authentication** → **Users**
2. Haz clic en **Add user**
3. Ingresa:
   - Email: `tu-email@ejemplo.com`
   - Password: (tu contraseña segura)
4. Marca **Auto Confirm User**
5. Luego, ve a **SQL Editor** y ejecuta:

```sql
INSERT INTO public.usuarios (id, email, nombre, rol)
VALUES (
  '[UUID-del-usuario-creado]', -- Copia el ID del usuario que acabas de crear
  'tu-email@ejemplo.com',
  'Tu Nombre',
  'admin'
);
```

#### Opción B: Crear función de registro en la app

Puedes crear una página de registro en la aplicación que use `authService.signUp()` (ya implementado en `/src/services/auth.service.ts`).

### 6. Reiniciar el Servidor de Desarrollo

```bash
# Detén el servidor actual (Ctrl + C)
# Inicia nuevamente
pnpm dev
```

### 7. Probar la Aplicación

1. **Login**: Intenta iniciar sesión con el usuario que creaste
2. **Registrar Cosecheros**: El componente ya está actualizado para usar Supabase
3. **Verificar en Supabase**: Ve a **Table Editor** en Supabase para ver los datos en tiempo real

## ✅ Componentes Actualizados

### Login (`/src/app/pages/Login.tsx`)
- ✅ Autenticación real con Supabase
- ✅ Manejo de errores
- ✅ Indicador de carga

### Registrar Cosecheros (`/src/app/pages/RegistrarCosecheros.tsx`)
- ✅ CRUD completo con Supabase
- ✅ Carga de datos en tiempo real
- ✅ Validación de documentos duplicados
- ✅ Indicadores de carga y errores

## 📊 Estructura de la Base de Datos

### Tabla `usuarios`
Extiende la autenticación de Supabase con información adicional del usuario.

**Campos:**
- `id` (UUID) - Referencia a `auth.users`
- `email` (TEXT)
- `nombre` (TEXT)
- `rol` (TEXT) - 'admin', 'supervisor', 'usuario'

### Tabla `cosecheros`
Almacena información de los cosecheros.

**Campos:**
- `id` (UUID)
- `nombre` (TEXT)
- `documento` (TEXT) - Único
- `telefono` (TEXT)
- `estado` (TEXT) - 'activo', 'inactivo'

### Tabla `lotes`
Almacena información de los lotes de café.

**Campos:**
- `id` (UUID)
- `nombre` (TEXT) - Único
- `descripcion` (TEXT)
- `hectareas` (NUMERIC)

### Tabla `pesajes`
Registra cada pesaje realizado.

**Campos:**
- `id` (UUID)
- `cosechero_id` (UUID) - FK a cosecheros
- `lote_id` (UUID) - FK a lotes
- `kilos_bruto` (NUMERIC)
- `descuento` (NUMERIC)
- `kilos_neto` (NUMERIC)
- `precio_kilo` (NUMERIC)
- `total_pagar` (NUMERIC)
- `fecha_pesaje` (TIMESTAMP)

## 🔐 Seguridad (Row Level Security)

Las políticas RLS están configuradas para:
- ✅ Permitir a usuarios autenticados leer y modificar todos los registros
- ✅ Los usuarios solo pueden ver/editar su propio perfil
- ✅ Solo usuarios autenticados pueden acceder a los datos

Si necesitas políticas más restrictivas, puedes modificarlas en el SQL Editor.

## 📝 Próximos Pasos

Para completar la integración, falta actualizar:

1. **Componente Cosecha** (`/src/app/pages/Cosecha.tsx`)
   - Integrar `pesajesService` y `cosechemrosService`
   - Cargar cosecheros desde la base de datos
   - Guardar pesajes en Supabase
   - Cargar historial desde la base de datos

2. **Proteger Rutas**
   - Envolver rutas protegidas con `<ProtectedRoute>`
   - Verificar autenticación antes de acceder al Dashboard

3. **Página de Registro**
   - Crear una página de registro usando `authService.signUp()`

4. **Módulos Restantes**
   - Registrar Lote (usando `lotesService`)
   - Ver Reportes (usando `pesajesService.getEstadisticasGenerales()`)
   - Gestión de Usuarios

## 🆘 Solución de Problemas

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

### No puedo iniciar sesión
- Verifica que el usuario existe en **Authentication** → **Users**
- Asegúrate de que el usuario tiene un registro en la tabla `usuarios`
- Verifica que la contraseña sea correcta

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Authentication](https://supabase.com/docs/guides/auth)
- [Guía de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Referencia de JavaScript Client](https://supabase.com/docs/reference/javascript)

---

Si tienes algún problema durante la configuración, revisa el archivo `/supabase/README.md` para más detalles o consulta la documentación de Supabase.
