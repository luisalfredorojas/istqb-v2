-- 1. Eliminar políticas anteriores si existen
DROP POLICY IF EXISTS "Authenticated users can insert exams" ON exams;
DROP POLICY IF EXISTS "Authenticated users can insert questions" ON questions;
DROP POLICY IF EXISTS "Allow all inserts for exams" ON exams;
DROP POLICY IF EXISTS "Allow all inserts for questions" ON questions;

-- 2. Crear políticas permisivas (TEMPORAL: Permite insertar a CUALQUIERA)
-- Esto es para asegurar que la migración funcione sin problemas de autenticación.
CREATE POLICY "Allow all inserts for exams" 
  ON exams FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow all inserts for questions" 
  ON questions FOR INSERT 
  WITH CHECK (true);
