import { supabase } from '@/lib/supabase';
import { ValidationError, buildExam, buildQuestions } from '@/utils/examJsonMapper';

interface MigrationResult {
  created: number;
  updated: number;
  errors: number;
  details: string[];
}

export const migrateExamsFromFiles = async (files: FileList): Promise<MigrationResult> => {
  const result: MigrationResult = { created: 0, updated: 0, errors: 0, details: [] };

  for (const file of Array.from(files)) {
    try {
      const raw = JSON.parse(await file.text());
      const data = Array.isArray(raw) ? raw[0] : raw;

      const questions = buildQuestions(data);
      const exam = buildExam(data, questions.length);

      // Una sola llamada transaccional: el examen y sus preguntas entran
      // juntos o no entra nada. Ver la migración ..._import_exam_atomic.sql
      const { data: rpcResult, error } = await supabase.rpc('import_exam', {
        p_exam: exam,
        p_questions: questions,
      });

      if (error) throw error;

      const { action, questions: inserted } = rpcResult as unknown as {
        action: 'created' | 'updated';
        questions: number;
      };

      const idioma = exam.language === 'es' ? 'español' : 'inglés';

      if (action === 'created') {
        result.created++;
        result.details.push(
          `✅ ${file.name}: creado "${exam.title}" en ${idioma} (${inserted} preguntas)`
        );
      } else {
        result.updated++;
        result.details.push(
          `🔄 ${file.name}: actualizado "${exam.title}" en ${idioma} (${inserted} preguntas, las anteriores fueron reemplazadas)`
        );
      }
    } catch (err) {
      result.errors++;
      const message = err instanceof Error ? err.message : 'Error desconocido';
      const prefix = err instanceof ValidationError ? 'JSON inválido' : 'Error';
      result.details.push(`❌ ${file.name}: ${prefix} — ${message}`);
      console.error(`Error procesando ${file.name}:`, err);
    }
  }

  return result;
};
