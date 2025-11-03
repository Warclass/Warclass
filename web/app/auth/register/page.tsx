"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import GuestLayout from "@/app/layouts/GuestLayout";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthNavButtons from "@/components/auth/AuthNavButtons";
import GameVignette from "@/components/layout/GameVignette";
import { useRegister } from "@/hooks/auth/useRegister";
import { useAuth } from "@/hooks/auth/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useRegister();
  const { login: authLogin } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
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

    if (formData.password !== formData.password_confirmation) {
      setValidationErrors({
        password_confirmation: "Las contraseñas no coinciden",
      });
      return;
    }

    const result = await register({
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    if (result.success && result.data) {
      authLogin(result.data.token, result.data.user);

      setStatus("¡Registro exitoso! Redirigiendo...");

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
      setErrorMessage(result.message || "Error al registrar usuario");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      <main className="grid min-h-screen place-items-center px-4 py-8">
        <Card className="w-full max-w-md rounded-xl border border-amber-400/20 bg-black/40 backdrop-blur-[2px] shadow-[0_0_40px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-neutral-100">
              Crear Cuenta
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Ingresa tus datos para registrarte en Warclass
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status && (
              <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-500">
                <AlertDescription className="text-green-700 dark:text-green-400">
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
                <Label htmlFor="name" className="text-neutral-700 dark:text-neutral-300">
                  Nombre Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoFocus
                  autoComplete="name"
                  className="border-neutral-300 dark:border-neutral-700 focus:ring-neutral-500"
                  disabled={isLoading}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-neutral-700 dark:text-neutral-300">
                  Nombre de Usuario <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="juanperez"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  className="border-neutral-300 dark:border-neutral-700 focus:ring-neutral-500"
                  disabled={isLoading}
                />
                {validationErrors.username && (
                  <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-700 dark:text-neutral-300">
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
                  autoComplete="email"
                  className="border-neutral-300 dark:border-neutral-700 focus:ring-neutral-500"
                  disabled={isLoading}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-300">
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
                  autoComplete="new-password"
                  className="border-neutral-300 dark:border-neutral-700 focus:ring-neutral-500"
                  disabled={isLoading}
                />
                {validationErrors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation" className="text-neutral-700 dark:text-neutral-300">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="border-neutral-300 dark:border-neutral-700 focus:ring-neutral-500"
                  disabled={isLoading}
                />
                {validationErrors.password_confirmation && (
                  <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.password_confirmation}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-6 text-lg shadow-[0_0_30px_rgba(245,158,11,0.25)]"
                disabled={isLoading}
              >
                {isLoading ? "Registrando..." : "Registrarse"}
              </Button>

              <div className="text-center pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  ¿Ya tienes una cuenta?{' '}
                  <Link
                    href="/auth/login"
                    className="text-neutral-700 dark:text-neutral-300 font-semibold hover:underline"
                  >
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      {/* Fixed nav buttons (left: 3 auth links, right: exit) */}
      <AuthNavButtons />
      {/* Atmospheric overlay */}
      <GameVignette />
    </GuestLayout>
  );
}
