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
      {/* <div className="bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900 text-white py-12 px-6 text-center border-b-4 border-neutral-600">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neutral-200 to-neutral-400 bg-clip-text text-transparent">
            Bienvenido a Warclass
          </h1>
          <p className="text-lg text-neutral-300 mb-6">
            Accede a tu mundo virtual de aprendizaje
          </p>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <span className="text-neutral-300">¿No tienes cuenta aún?</span>
            <Link href="/auth/type-users">
              <Button
                variant="outline"
                className="bg-neutral-700 hover:bg-neutral-600 text-white border-neutral-500"
              >
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </div> */}

      <div className="flex justify-center items-center flex-grow p-6 bg-transparent">
        <Card className="w-full max-w-md shadow-2xl border-neutral-200 dark:border-neutral-800">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-neutral-700 to-neutral-900 dark:from-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              Ingresa tus credenciales para acceder a tu cuenta
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
                <Label
                  htmlFor="email"
                  className="text-neutral-700 dark:text-neutral-300"
                >
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
                  className="border-neutral-300 dark:border-neutral-700 focus:ring-neutral-500"
                  disabled={isLoading}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-neutral-700 dark:text-neutral-300"
                >
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
                  className="border-neutral-300 dark:border-neutral-700 focus:ring-neutral-500"
                  disabled={isLoading}
                />
                {validationErrors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400">
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
                  <Label
                    htmlFor="remember"
                    className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  >
                    Recordarme
                  </Label>
                </div>

                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-neutral-700 hover:bg-neutral-800 dark:bg-neutral-600 dark:hover:bg-neutral-700 text-white font-semibold py-6 text-lg"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>

              <div className="text-center pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  ¿Primera vez aquí?{" "}
                  <Link
                    href="/auth/register"
                    className="text-neutral-700 dark:text-neutral-300 font-semibold hover:underline"
                  >
                    Crea una cuenta
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </GuestLayout>
  );
}
