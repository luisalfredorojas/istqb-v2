import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabaseAdmin } from '@/lib/supabase';
import { migrateExamsFromFiles } from '@/utils/migrateExamsFromFiles';
import type { Exam } from '@/types';

interface ExamFormData {
  title: string;
  description: string;
  category: string;
  difficulty: 'Foundation' | 'Advanced' | 'Expert';
  duration_minutes: number;
  passing_score: number;
  total_questions: number;
  is_active: boolean;
}

const defaultFormData: ExamFormData = {
  title: '',
  description: '',
  category: 'ISTQB',
  difficulty: 'Foundation',
  duration_minutes: 60,
  passing_score: 65,
  total_questions: 40,
  is_active: true,
};

export function ExamManagementPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: roleData, isLoading: roleLoading } = useUserRole(user?.id);
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState<ExamFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [deletingExamId, setDeletingExamId] = useState<number | null>(null);
  const [migrating, setMigrating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not admin (wait for both auth and role to load)
  useEffect(() => {
    // Wait for both to finish loading
    if (authLoading || roleLoading) {
      return;
    }
    
    // If no user after loading, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }
    
    // If not admin, redirect to dashboard
    if (!roleData?.isAdmin) {
      navigate('/dashboard');
    }
  }, [authLoading, roleData, roleLoading, navigate, user]);

  // Load exams
  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    setLoading(true);
    const { data, error } = await supabaseAdmin
      .from('exams')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error loading exams:', error);
    } else {
      setExams(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      description: exam.description || '',
      category: exam.category,
      difficulty: (exam.difficulty as 'Foundation' | 'Advanced' | 'Expert') || 'Foundation',
      duration_minutes: exam.duration_minutes,
      passing_score: exam.passing_score,
      total_questions: exam.total_questions,
      is_active: exam.is_active,
    });
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingExam(null);
    setFormData(defaultFormData);
    setShowForm(true);
  };

  const handleDeleteClick = (examId: number) => {
    console.log('[handleDeleteClick] Opening confirmation for exam ID:', examId);
    setDeletingExamId(examId);
  };

  const confirmDelete = async () => {
    if (!deletingExamId) return;
    
    console.log('[confirmDelete] User confirmed, deleting exam ID:', deletingExamId);
    const { error } = await supabaseAdmin
      .from('exams')
      .delete()
      .eq('id', deletingExamId);

    if (error) {
      console.error('[confirmDelete] Error deleting exam:', error);
      alert('Error al eliminar: ' + error.message);
    } else {
      console.log('[confirmDelete] Exam deleted successfully, reloading list...');
      loadExams();
    }
    setDeletingExamId(null);
  };

  const cancelDelete = () => {
    console.log('[cancelDelete] User cancelled deletion');
    setDeletingExamId(null);
  };

  const handleMigrateClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setMigrating(true);
    console.log(`[handleFileChange] Starting migration of ${files.length} file(s)`);

    try {
      const result = await migrateExamsFromFiles(files);
      
      // Show detailed results
      const message = [
        '📊 Resumen de Migración:',
        `✅ Exitosos: ${result.success}`,
        `⚠️ Duplicados omitidos: ${result.duplicates}`,
        `❌ Errores: ${result.errors}`,
        '',
        '📋 Detalles:',
        ...result.details
      ].join('\n');

      alert(message);
      console.log('[handleFileChange] Migration completed:', result);

      // Reload exams list
      if (result.success > 0) {
        loadExams();
      }
    } catch (error) {
      console.error('[handleFileChange] Migration failed:', error);
      alert(`Error durante la migración: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setMigrating(false);
      // Reset file input so the same file can be selected again
      if (e.target) {
        e.target.value = '';
      }
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingExam) {
        // Update
        const { error } = await supabaseAdmin
          .from('exams')
          .update(formData)
          .eq('id', editingExam.id);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabaseAdmin
          .from('exams')
          .insert(formData);

        if (error) throw error;
      }

      setShowForm(false);
      loadExams();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Show loading while checking auth or role
  if (authLoading || roleLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!user || !roleData?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a esta página.</p>
          <a href="/dashboard" className="text-blue-600 hover:underline">Volver al Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Exámenes</h1>
          <p className="text-gray-600 mt-1">Administra los exámenes de la plataforma</p>
        </div>
        <div className="flex gap-3">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          

          
          {/* Dropdown for Migration Options */}
          <div className="relative group">
            <Button
              variant="outline"
              disabled={migrating}
            >
              {migrating ? '⏳ Migrando...' : '🚀 Migrar desde JSON ▾'}
            </Button>
            
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-100 hidden group-hover:block z-50">
               <div className="py-1">
                 <button
                   onClick={handleMigrateClick}
                   className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                 >
                   📤 Subir archivo(s) JSON
                 </button>
                 <button
                   onClick={() => import('@/utils/migrateExams').then(m => m.migrateExams())}
                   className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                 >
                   🔄 Migrar locales (Legacy)
                 </button>
               </div>
            </div>
          </div>
          <Button onClick={handleCreate}>
            + Nuevo Examen
          </Button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingExam ? 'Editar Examen' : 'Nuevo Examen'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Categoría</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dificultad</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Foundation">Foundation</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duración (min)</label>
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded-lg"
                      min={1}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Puntaje Mínimo (%)</label>
                    <input
                      type="number"
                      value={formData.passing_score}
                      onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded-lg"
                      min={0}
                      max={100}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Preguntas</label>
                    <input
                      type="number"
                      value={formData.total_questions}
                      onChange={(e) => setFormData({ ...formData, total_questions: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded-lg"
                      min={1}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    Examen activo
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? 'Guardando...' : (editingExam ? 'Actualizar' : 'Crear')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exams List */}
      {loading ? (
        <div className="text-center py-12">Cargando exámenes...</div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">No hay exámenes creados todavía.</p>
            <Button onClick={handleCreate}>Crear primer examen</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{exam.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded ${exam.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {exam.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {exam.category} • {exam.difficulty} • {exam.total_questions} preguntas • {exam.duration_minutes} min
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(exam)}>
                      ✏️ Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteClick(exam.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      🗑️ Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExamId !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={cancelDelete}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 border-gray-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">⚠️ Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de eliminar este examen? Esta acción no se puede deshacer y también se eliminarán todas sus preguntas.
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={cancelDelete}
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                🗑️ Eliminar Examen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
