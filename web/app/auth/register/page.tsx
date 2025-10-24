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
        router.push("/character");
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
      <AuthHeader
        preText="¿Ya tienes una cuenta?"
        ctaHref="/auth/login"
        ctaLabel="INICIAR SESIÓN"
      />

      <main className="grid h-[calc(100vh-56px)] place-items-center bg-[#0b0b0b] px-4">
        <Card className="w-full max-w-3xl border-neutral-800 bg-[#1a1a1a] shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-neutral-100">
              Crear Cuenta
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Completa el formulario para unirte a nuestra comunidad
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
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.values(validationErrors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-100">
                  Información Personal
                </h3>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-neutral-300">
                      Nombre Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Juan Pérez García"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoFocus
                      autoComplete="name"
                      className="border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-amber-500"
                      disabled={isLoading}
                    />
                    {validationErrors.name && (
                      <p className="text-sm text-red-400">
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-neutral-300">
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
                      className="border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-amber-500"
                      disabled={isLoading}
                    />
                    {validationErrors.username && (
                      <p className="text-sm text-red-400">
                        {validationErrors.username}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-100">
                  Información de Contacto
                </h3>
                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-neutral-300">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="juan@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-amber-500"
                    disabled={isLoading}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-400">
                      {validationErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-100">
                  Seguridad
                </h3>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      autoComplete="new-password"
                      className="border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-amber-500"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-neutral-500">
                      Mínimo 6 caracteres
                    </p>
                    {validationErrors.password && (
                      <p className="text-sm text-red-400">
                        {validationErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation" className="text-neutral-300">
                      Confirmar Contraseña{" "}
                      <span className="text-red-500">*</span>
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
                      className="border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-amber-500"
                      disabled={isLoading}
                    />
                    {validationErrors.password_confirmation && (
                      <p className="text-sm text-red-400">
                        {validationErrors.password_confirmation}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-6 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-neutral-400">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/auth/login" className="font-semibold text-amber-400 hover:text-amber-300 underline">
                      Inicia sesión aquí
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </GuestLayout>
  );
}
