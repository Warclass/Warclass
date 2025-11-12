import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';

interface CourseData {
  id: string;
  name: string;
  description?: string;
  [key: string]: any;
}

/**
 * Hook para obtener datos del curso por courseId
 * Funciona tanto para profesores como para estudiantes
 * Guarda en localStorage para cargar más rápido
 */
export function useCourseData(courseId: string | null) {
  const { user, token } = useAuth();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId || !user?.id || !token) {
        console.log('⚠️ Missing required data:', { courseId, userId: user?.id, hasToken: !!token });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Intentar cargar desde localStorage primero
        const cacheKey = `course_${courseId}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const cachedData = JSON.parse(cached);
            console.log('💾 Loaded from cache:', cachedData.name);
            setCourseData(cachedData);
            // Continuar cargando en background para actualizar
          } catch (e) {
            console.log('⚠️ Cache parse error, will fetch fresh');
          }
        }

        console.log('🔍 useCourseData - Fetching course:', courseId);
        console.log('🆔 CourseId type:', typeof courseId);
        console.log('🆔 CourseId length:', courseId?.length);
        console.log('👤 User ID:', user.id);

        // Intentar primero como profesor
        console.log('👨‍🏫 Trying as teacher...');
        let response = await fetch(`/api/courses/teacher`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 Teacher endpoint status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('📚 Teacher courses response:', data);
          
          if (data.courses && Array.isArray(data.courses)) {
            console.log('📋 Total courses found:', data.courses.length);
            console.log('🔎 Looking for courseId:', courseId);
            console.log('� CourseId (trimmed):', courseId?.trim());
            console.log('�📚 Available course IDs:', data.courses.map((c: any) => c.id));
            console.log('📚 IDs match test:', data.courses.map((c: any) => ({
              id: c.id,
              matches: c.id === courseId,
              matchesTrimmed: c.id === courseId?.trim()
            })));
            
            const course = data.courses.find((c: CourseData) => c.id === courseId);
            if (course) {
              console.log('✅ Course found (as teacher):', course.name);
              
              // Guardar en localStorage
              const cacheKey = `course_${courseId}`;
              localStorage.setItem(cacheKey, JSON.stringify(course));
              console.log('💾 Saved to cache:', cacheKey);
              
              setCourseData(course);
              setLoading(false);
              return;
            } else {
              console.log('⚠️ Course not found in teacher courses - WILL try student endpoint');
              // No hacer return aquí, continuar al endpoint de estudiante
            }
          } else if (data.success === true && data.courses && data.courses.length === 0) {
            // Es profesor pero no tiene cursos aún
            console.log('⚠️ Teacher has no courses yet - WILL try student endpoint');
            // No hacer return aquí, continuar al endpoint de estudiante
          } else {
            console.log('⚠️ Unexpected teacher response format');
          }
        } else {
          console.log('❌ Teacher endpoint failed:', response.status, response.statusText);
        }

        // Si no es profesor o no encontró el curso, intentar como estudiante
        console.log('🎓 Trying as student...');
        response = await fetch(`/api/characters/course?courseId=${courseId}`, {
          headers: {
            'x-user-id': user.id,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 Student endpoint status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('📖 Student course response:', data);
          
          // El endpoint devuelve { success, hasCharacter, data: { ...character, course: {...} } }
          if (data.success && data.data && data.data.course) {
            console.log('✅ Course found (as student):', data.data.course.name);
            
            // Guardar en localStorage
            const cacheKey = `course_${courseId}`;
            localStorage.setItem(cacheKey, JSON.stringify(data.data.course));
            console.log('💾 Saved to cache:', cacheKey);
            
            setCourseData(data.data.course);
          } else {
            console.log('⚠️ No course data in student response');
            setError('No tienes acceso a este curso');
          }
        } else {
          console.log('❌ Student endpoint failed:', response.status, response.statusText);
          // No lanzar error, solo establecer el mensaje
          setError(`No se pudo cargar el curso (${response.status})`);
        }
      } catch (err: any) {
        console.error('❌ Error al cargar datos del curso:', err);
        setError(err.message || 'Error al cargar el curso');
      } finally {
        setLoading(false);
        console.log('🏁 useCourseData fetch completed');
      }
    };

    fetchCourseData();
  }, [courseId, user?.id, token]);

  return { courseData, loading, error };
}
