-- Eliminar la restricción de dificultad para permitir la migración
ALTER TABLE exams DROP CONSTRAINT IF EXISTS exams_difficulty_check;

-- Opcional: Si también da problemas en preguntas
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_difficulty_check;
