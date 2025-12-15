import { supabase } from '@/lib/supabase';
import examA from '@/data/exams/foundation-level-exam-a.json';
import examB from '@/data/exams/foundation-level-exam-b.json';
import examC from '@/data/exams/foundation-level-exam-c.json';
import examD from '@/data/exams/foundation-level-exam-d.json';
import examAdvanced from '@/data/exams/advanced-level-test-analyst.json';

const examsToMigrate = [examA, examB, examC, examD, examAdvanced];

export const migrateExams = async () => {
  console.log('Starting migration...');
  let successCount = 0;
  let errorCount = 0;

  for (const examData of examsToMigrate) {
    try {
      // 1. Prepare Exam Data
      // Handle array wrapper if present (some files might be [ { ... } ])
      const data = Array.isArray(examData) ? examData[0] : examData;
      
      const title = data.titulo || data.title;
      const description = data.descripcion || data.description || 'Sin descripción';
      const category = 'ISTQB'; // Default
      const difficulty = title.toLowerCase().includes('advanced') ? 'Advanced' : 'Foundation';
      const totalQuestions = data.examen ? data.examen.length : 0;
      const passingScoreRaw = data.minimo_aprobacion || Math.ceil(totalQuestions * 0.65);
      const passingScorePercent = Math.round((passingScoreRaw / totalQuestions) * 100);

      console.log(`Migrating: ${title}`);

      // 2. Insert Exam
      const { data: insertedExam, error: examError } = await supabase
        .from('exams')
        .insert({
          title,
          description,
          category,
          difficulty,
          duration_minutes: difficulty === 'Advanced' ? 120 : 60, // Standard times
          passing_score: passingScorePercent,
          total_questions: totalQuestions,
          is_active: true
        } as any)
        .select()
        .single();

      if (examError) {
        console.error(`Error creating exam ${title}:`, examError);
        errorCount++;
        continue;
      }

      const examId = (insertedExam as any).id;
      console.log(`Created Exam ID: ${examId}`);

      // 3. Prepare Questions
      const questionsToInsert = data.examen.map((q: any, index: number) => {
        // Map correct answer index to letter
        // Some JSONs might have array for multiple correct answers, or single index
        let correctAnswer = 'a';
        if (Array.isArray(q.respuesta_correcta)) {
           // If multiple, just take the first one for now or handle mixed
           // Our schema supports single string. Let's map 0->a, 1->b etc.
           const idx = q.respuesta_correcta[0];
           correctAnswer = String.fromCharCode(97 + idx); // 97 is 'a'
        } else {
           const idx = q.respuesta_correcta;
           correctAnswer = String.fromCharCode(97 + idx);
        }

        // Map options
        const options = q.opciones.map((opt: string, i: number) => ({
          id: String.fromCharCode(97 + i), // 'a', 'b', 'c'...
          content: opt.replace(/^[a-z]\)\s*/i, ''), // Clean "a) " prefix
          type: 'text'
        }));

        return {
          exam_id: examId,
          question_type: 'text', // Default
          question_text: Array.isArray(q.pregunta) ? q.pregunta.join(' ') : q.pregunta,
          question_image_url: q.imageUrl || null,
          options,
          correct_answer: correctAnswer,
          explanation: q.explicacion,
          order_index: index + 1
        };
      });

      // 4. Insert Questions (in batches if needed, but 40 is small)
      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert as any);

      if (questionsError) {
        console.error(`Error inserting questions for ${title}:`, questionsError);
        errorCount++;
      } else {
        successCount++;
        console.log(`Successfully migrated ${title} with ${questionsToInsert.length} questions.`);
      }

    } catch (err) {
      console.error('Unexpected error:', err);
      errorCount++;
    }
  }

  alert(`Migración completada.\nÉxitos: ${successCount}\nErrores: ${errorCount}`);
};
