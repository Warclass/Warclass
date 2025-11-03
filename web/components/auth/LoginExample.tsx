'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/hooks/auth/useLogin';
import { useAuth } from '@/hooks/auth/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginExample() {
  const router = useRouter();
  const { login, isLoading, error } = useLogin();
  const { login: authLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const result = await login(formData);

    if (result.success && result.data) {
      authLogin(result.data.token, result.data.user);
      router.push('/dashboard');
    } else if (result.error === 'VALIDATION_ERROR' && 'details' in result) {
      const errors: Record<string, string> = {};
      (result as any).details?.forEach((detail: any) => {
        errors[detail.field] = detail.message;
      });
      setValidationErrors(errors);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-neutral-700/40 bg-transparent backdrop-blur-[2px] shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-neutral-100">Iniciar Sesión</CardTitle>
          <CardDescription className="text-neutral-400">
            Ingresa tus credenciales para acceder a Warclass
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-500 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="juan@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-amber-500"
              />
              {validationErrors.email && (
                <p className="text-sm text-red-400">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-300">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-amber-500"
              />
              {validationErrors.password && (
                <p className="text-sm text-red-400">{validationErrors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
