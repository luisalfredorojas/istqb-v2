# Guía de Migración a Nuevo Proyecto Supabase

## Variables de Entorno Necesarias

Actualiza tu archivo `.env.local` con los nuevos valores de tu proyecto Supabase:

```bash
# Obtén estos valores de: Supabase Dashboard > Settings > API
VITE_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=tu_nueva_anon_key
```

---

## Pasos en Supabase Dashboard

### 1. Crear las Tablas

Ve a **SQL Editor** y ejecuta los siguientes queries en orden:

---

### Query 1: Crear Extensiones y Tablas Principales

```sql
-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: exams
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Foundation', 'Advanced', 'Expert')),
  duration_minutes INTEGER NOT NULL,
  passing_score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA: questions
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'image', 'mixed')),
  question_text TEXT,
  question_image_url TEXT,
  question_image_alt TEXT,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  explanation_image_url TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[],
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA: users (para perfil de usuario)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  firebase_uid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  preferences JSONB DEFAULT '{}'::jsonb
);

-- 4. TABLA: user_exam_attempts (intentos de examen)
CREATE TABLE IF NOT EXISTS user_exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INTEGER,
  percentage INTEGER,
  passed BOOLEAN,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### Query 2: Habilitar RLS y Crear Políticas

```sql
-- Habilitar Row Level Security
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exam_attempts ENABLE ROW LEVEL SECURITY;

-- Políticas para EXAMS (lectura pública)
CREATE POLICY "Exams are viewable by everyone" 
  ON exams FOR SELECT 
  USING (true);

CREATE POLICY "Allow all inserts for exams" 
  ON exams FOR INSERT 
  WITH CHECK (true);

-- Políticas para QUESTIONS (lectura pública)
CREATE POLICY "Questions are viewable by everyone" 
  ON questions FOR SELECT 
  USING (true);

CREATE POLICY "Allow all inserts for questions" 
  ON questions FOR INSERT 
  WITH CHECK (true);

-- Políticas para USERS
CREATE POLICY "Users can view own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON users FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile (limited)"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    -- Prevenir que usuarios cambien su subscription_tier
    (subscription_tier IS NULL OR subscription_tier = (SELECT subscription_tier FROM users WHERE id = auth.uid()))
  );

-- Políticas para USER_EXAM_ATTEMPTS
CREATE POLICY "Users can view own attempts" 
  ON user_exam_attempts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts" 
  ON user_exam_attempts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts" 
  ON user_exam_attempts FOR UPDATE 
  USING (auth.uid() = user_id);
```

---

### Query 3: Crear Trigger para Usuario Automático

Este trigger crea automáticamente un registro en `users` cuando alguien se registra:

```sql
-- Función para crear perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta al crear usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

### Query 4: Insertar Examen Inicial

```sql
INSERT INTO exams (title, description, category, difficulty, duration_minutes, passing_score, total_questions)
VALUES 
  ('ISTQB Foundation Level', 'Certificación base en testing de software', 'ISTQB', 'Foundation', 60, 65, 40);
```

---

## Configurar Autenticación

### En Supabase Dashboard > Authentication > Providers:

1. **Email** - Habilitar registro con email
2. **Google** (Opcional) - Configurar OAuth con tu client ID

### En Supabase Dashboard > Authentication > URL Configuration:

- **Site URL**: `https://tu-dominio.com` (o `http://localhost:5173` para dev)
- **Redirect URLs**: 
  - `http://localhost:5173/auth/callback`
  - `https://tu-dominio.com/auth/callback`

---

## Configurar Storage (Imágenes de Preguntas)

Las imágenes de las preguntas se guardan en **Supabase Storage**. Necesitas crear un bucket:

### Paso 1: Crear Bucket

Ve a **Storage** en el dashboard de Supabase y crea un nuevo bucket:

- **Nombre**: `exam-images`
- **Public**: ✅ Habilitar (para que las imágenes sean accesibles)

### Paso 2: Crear Estructura de Carpetas

Dentro del bucket `exam-images`, crea la carpeta:
```
exam-images/
  └── foundation-level/
```

### Paso 3: Subir Imágenes (si las tienes)

Si tienes imágenes de preguntas:
1. Ve a Storage > exam-images > foundation-level
2. Sube las imágenes con los nombres exactos que están en los JSON

> **Nota**: Las imágenes se referencian en el código así:
> ```
> ${VITE_SUPABASE_URL}/storage/v1/object/public/exam-images/foundation-level/nombre-imagen.png
> ```

---

## Cómo se Guardan los Exámenes

Los exámenes se migran desde archivos JSON locales a la base de datos.

### Los JSON están en:
```
src/data/exams/
  ├── foundation-level-exam-a.json
  ├── foundation-level-exam-b.json
  ├── foundation-level-exam-c.json
  └── foundation-level-exam-d.json
```

### Para migrar exámenes:

1. Inicia la aplicación
2. Ve al Dashboard
3. Haz clic en el botón **🚀 Migrar Exámenes**

Esto insertará automáticamente todos los exámenes y preguntas en la base de datos.

> **Importante**: Si ya migraste antes, este botón creará duplicados. Vacía las tablas `exams` y `questions` primero si quieres re-migrar.

---

## Resumen de Cambios en el Código

1. Actualiza `.env.local`:
```bash
VITE_SUPABASE_URL=https://TU_NUEVO_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu_nueva_anon_key
```

2. Actualiza las variables de entorno en Netlify (ver sección siguiente)

3. Despliega nuevamente tu aplicación

---

## Configuración de Netlify

### Paso 1: Variables de Entorno

Ve a tu sitio en **Netlify Dashboard > Site settings > Environment variables** y agrega:

| Variable | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://TU_PROYECTO.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Tu anon key de Supabase |
| `VITE_PAYPAL_DONATE_URL` | (Opcional) URL de donación PayPal |

### Paso 2: netlify.toml

El archivo ya existe en la raíz del repositorio (`netlify.toml`):

```toml
[build]
  base = "testifyhq-new"
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

# Headers de seguridad
[[headers]]
  for = "/*"
  [headers.values]
    Referrer-Policy = "origin-when-cross-origin"
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
```

### Paso 3: Configurar Redirects para SPA

Crea el archivo `testifyhq-new/public/_redirects`:

```
/*    /index.html   200
```

Esto asegura que las rutas de React funcionen correctamente.

### Paso 4: Actualizar Supabase con URL de Netlify

En **Supabase Dashboard > Authentication > URL Configuration**:

- **Site URL**: `https://tu-sitio.netlify.app`
- **Redirect URLs**:
  - `https://tu-sitio.netlify.app/auth/callback`
  - `http://localhost:5173/auth/callback` (para desarrollo)

### Paso 5: Desplegar

1. Haz commit de los cambios
2. Push a tu repositorio
3. Netlify desplegará automáticamente

---

## Checklist de Migración

- [ ] Crear nuevo proyecto en Supabase
- [ ] Ejecutar los 4 queries SQL
- [ ] Crear bucket `exam-images` en Storage
- [ ] Configurar Authentication URLs
- [ ] Actualizar variables de entorno en Netlify
- [ ] Crear archivo `_redirects`
- [ ] Desplegar en Netlify
- [ ] Migrar exámenes desde el Dashboard

