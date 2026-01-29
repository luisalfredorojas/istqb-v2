import { supabaseAdmin as supabase } from '@/lib/supabase';

interface MigrationResult {
  success: number;
  errors: number;
  duplicates: number;
  details: string[];
}

export const migrateExamsFromFiles = async (files: FileList): Promise<MigrationResult> => {
  console.log(`Starting migration of ${files.length} file(s)...`);
  
  const result: MigrationResult = {
    success: 0,
    errors: 0,
    duplicates: 0,
    details: []
  };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      // Read file content
      const fileContent = await file.text();
      const examData = JSON.parse(fileContent);
      
      // Handle array wrapper if present (some files might be [ { ... } ])
      const data: any = Array.isArray(examData) ? examData[0] : examData;
      
      const title = data.titulo || data.title;
      const description = data.descripcion || data.description || 'Sin descripción';
      const category = 'ISTQB'; // Default
      const difficulty = title.toLowerCase().includes('advanced') ? 'advanced' : 'foundation';
      const totalQuestions = data.examen ? data.examen.length : 0;
      const passingScoreRaw = data.minimo_aprobacion || Math.ceil(totalQuestions * 0.65);
      const passingScorePercent = Math.round((passingScoreRaw / totalQuestions) * 100);

      console.log(`Processing: ${title} from ${file.name}`);

      // Check for duplicates by title
      const { data: existingExam, error: checkError } = await supabase
        .from('exams')
        .select('id, title')
        .eq('title', title)
        .maybeSingle();

      if (checkError) {
        console.error(`Error checking for duplicates:`, checkError);
        result.errors++;
        result.details.push(`❌ ${file.name}: Error checking duplicates - ${checkError.message}`);
        continue;
      }

      if (existingExam) {
        // Update existing exam
        console.log(`Updating existing exam: ${title} (ID: ${(existingExam as any).id})`);
        
        // Update exam metadata
        const { error: updateError } = await supabase
          .from('exams')
          .update({
             title,
             description,
             category,
             difficulty,
             duration_minutes: difficulty === 'advanced' ? 120 : 60,
             passing_score: passingScorePercent,
             total_questions: totalQuestions,
             is_active: true
          })
          .eq('id', (existingExam as any).id);
          
         if (updateError) {
            console.error(`Error updating exam ${title}:`, updateError);
            result.errors++;
            result.details.push(`❌ ${file.name}: Error updating exam - ${updateError.message}`);
            continue;
         }
         
         // Delete existing questions to replace them
         const { error: deleteQuestionsError } = await supabase
            .from('questions')
            .delete()
            .eq('exam_id', (existingExam as any).id);
            
         if (deleteQuestionsError) {
            console.error(`Error deleting old questions for ${title}:`, deleteQuestionsError);
            // We continue anyway to try to insert new ones, or maybe abort? 
            // Let's continue but warn
         }
         
         // Reuse ID for question insertion
         var examId = (existingExam as any).id;
         result.duplicates++; // Count as "updated" (or we could add an 'updated' counter)
         result.details.push(`🔄 ${file.name}: Updated "${title}" (replaced questions)`);
      } else {
          // Insert New Exam
          const { data: insertedExam, error: examError } = await supabase
            .from('exams')
            .insert({
              title,
              description,
              category,
              difficulty,
              duration_minutes: difficulty === 'advanced' ? 120 : 60,
              passing_score: passingScorePercent,
              total_questions: totalQuestions,
              is_active: true
            } as any)
            .select()
            .single();

          if (examError) {
            console.error(`Error creating exam ${title}:`, examError);
            result.errors++;
            result.details.push(`❌ ${file.name}: Error creating exam - ${examError.message}`);
            continue;
          }
           var examId = (insertedExam as any).id;
           console.log(`Created Exam ID: ${examId}`);
      }

      // Prepare Questions
      const questionsToInsert = data.examen.map((q: any, index: number) => {
        // Map correct answer index to letter
        let correctAnswer = 'a';
        if (Array.isArray(q.respuesta_correcta)) {
          const idx = q.respuesta_correcta[0];
          correctAnswer = String.fromCharCode(97 + idx);
        } else {
          const idx = q.respuesta_correcta;
          correctAnswer = String.fromCharCode(97 + idx);
        }

        // Map options
        const options = q.opciones.map((opt: string, i: number) => ({
          id: String.fromCharCode(97 + i),
          content: opt.replace(/^[a-z]\)\s*/i, ''),
          type: 'text'
        }));

        return {
          exam_id: examId,
          question_type: 'text',
          question_text: Array.isArray(q.pregunta) ? q.pregunta.join(' ') : q.pregunta,
          question_image_url: q.imageUrl || null,
          options,
          correct_answer: correctAnswer,
          explanation: q.explicacion,
          explanation_video_url: q.video_explicacion || null,
          order_index: index + 1
        };
      });

      // Insert Questions
      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert as any);

      if (questionsError) {
        console.error(`Error inserting questions for ${title}:`, questionsError);
        result.errors++;
        result.details.push(`❌ ${file.name}: Exam created but error inserting questions - ${questionsError.message}`);
      } else {
        result.success++;
        result.details.push(`✅ ${file.name}: Successfully migrated "${title}" (${questionsToInsert.length} questions)`);
        console.log(`Successfully migrated ${title} with ${questionsToInsert.length} questions.`);
      }

    } catch (err) {
      console.error(`Unexpected error processing ${file.name}:`, err);
      result.errors++;
      result.details.push(`❌ ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return result;
};
