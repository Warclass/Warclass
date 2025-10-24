"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import GuestLayout from "@/app/layouts/GuestLayout";
import AuthHeader from "@/components/auth/AuthHeader";
import { useLogin } from "@/hooks/auth/useLogin";
import { useAuth } from "@/hooks/auth/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useLogin();
  const { login: authLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [errorMessage, setErrorMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setErrorMessage("");
    setStatus("");

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (result.success && result.data) {
      authLogin(result.data.token, result.data.user);

      setStatus("¡Inicio de sesión exitoso! Redirigiendo...");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } else if (result.error === "VALIDATION_ERROR" && "details" in result) {
      const errors: Record<string, string> = {};
      (result as any).details?.forEach((detail: any) => {
        errors[detail.field] = detail.message;
      });
      setValidationErrors(errors);
    } else {
      setErrorMessage(result.message || "Error al iniciar sesión");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  return (
    <GuestLayout>
      <AuthHeader
        preText="¿No tienes cuenta aún?"
        ctaHref="/auth/type-users"
        ctaLabel="REGISTRARSE"
      />

      <main className="grid h-[calc(100vh-56px)] place-items-center bg-[#0b0b0b] px-4">
        <Card className="w-full max-w-md border-neutral-800 bg-[#1a1a1a] shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-neutral-100">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>

          <CardContent>
            {status && (
              <Alert className="mb-4 bg-green-900/20 border-green-500">
                <AlertDescription className="text-green-400">
                  {status}
                </AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {Object.keys(validationErrors).length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.values(validationErrors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-300">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoFocus
                  autoComplete="username"
                  className="border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-amber-500"
                  disabled={isLoading}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-400">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-neutral-300">
                  Contraseña <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-amber-500"
                  disabled={isLoading}
                />
                {validationErrors.password && (
                  <p className="text-sm text-red-400">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.remember}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        remember: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="remember" className="text-sm text-neutral-400 cursor-pointer">
                    Recordarme
                  </Label>
                </div>

                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-amber-400 hover:text-amber-300 underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-6 text-lg"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>

              <div className="text-center pt-4 border-t border-neutral-800">
                <p className="text-sm text-neutral-400">
                  ¿Primera vez aquí?{" "}
                  <Link href="/auth/register" className="font-semibold text-amber-400 hover:text-amber-300 underline">
                    Crea una cuenta
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </GuestLayout>
  );
}
