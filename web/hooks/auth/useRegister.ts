import { useState } from 'react';
import { RegisterInput } from '@/backend/validators/auth.validator';
import { AuthResponse } from '@/backend/types/auth.types';

interface UseRegisterReturn {
  register: (data: RegisterInput) => Promise<AuthResponse>;
  isLoading: boolean;
  error: string | null;
  data: AuthResponse | null;
}

export function useRegister(): UseRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AuthResponse | null>(null);

  const register = async (registerData: RegisterInput): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result: AuthResponse = await response.json();

      if (!result.success) {
        setError(result.error || 'Error al registrar usuario');
      }

      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      
      const errorResult: AuthResponse = {
        success: false,
        message: 'Error de conexión',
        error: errorMessage,
      };
      
      setData(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    isLoading,
    error,
    data,
  };
}
