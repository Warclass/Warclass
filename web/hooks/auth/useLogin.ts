import { useState } from 'react';
import { LoginInput } from '@/backend/validators/auth.validator';
import { AuthResponse } from '@/backend/types/auth.types';

interface UseLoginReturn {
  login: (data: LoginInput) => Promise<AuthResponse>;
  isLoading: boolean;
  error: string | null;
  data: AuthResponse | null;
}

export function useLogin(): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AuthResponse | null>(null);

  const login = async (loginData: LoginInput): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const result: AuthResponse = await response.json();

      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión');
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
    login,
    isLoading,
    error,
    data,
  };
}
