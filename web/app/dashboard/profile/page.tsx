"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Lock, 
  ArrowLeft,
  Save,
  Eye,
  EyeOff
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/auth/useAuth";

interface ProfileData {
  name: string;
  email: string;
  username: string;
}

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    username: "",
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        username: user.username,
      });
    }
  }, [user]);

  // Actualizar perfil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProfile(true);
    setProfileMessage(null);

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (result.success) {
        setProfileMessage({ type: "success", text: result.message });
        // Actualizar datos del usuario en el contexto
        await refreshUser();
      } else {
        setProfileMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setProfileMessage({ 
        type: "error", 
        text: "Error al actualizar perfil" 
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingPassword(true);
    setPasswordMessage(null);

    // Validaciones básicas
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ 
        type: "error", 
        text: "Las contraseñas nuevas no coinciden" 
      });
      setIsLoadingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ 
        type: "error", 
        text: "La contraseña debe tener al menos 6 caracteres" 
      });
      setIsLoadingPassword(false);
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const result = await response.json();

      if (result.success) {
        setPasswordMessage({ type: "success", text: result.message });
        // Limpiar formulario
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setPasswordMessage({ 
        type: "error", 
        text: "Error al cambiar contraseña" 
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[#0f0f0f]/95 backdrop-blur">
        <div className="max-w-4xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Volver al Dashboard</span>
          </Link>
          
          <Button
            variant="ghost"
            onClick={logout}
            className="text-neutral-400 hover:text-neutral-100"
          >
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">
            Mi Perfil
          </h1>
          <p className="text-neutral-400">
            Administra tu información personal y configuración de seguridad
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a1a1a] border border-neutral-800">
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-[#D89216] data-[state=active]:text-black"
            >
              <User className="h-4 w-4 mr-2" />
              Información Personal
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="data-[state=active]:bg-[#D89216] data-[state=active]:text-black"
            >
              <Lock className="h-4 w-4 mr-2" />
              Seguridad
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card className="bg-[#1a1a1a] border-neutral-800">
              <CardHeader>
                <CardTitle className="text-neutral-100">
                  Datos Personales
                </CardTitle>
                <CardDescription className="text-neutral-400">
                  Actualiza tu información personal y de contacto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {profileMessage && (
                    <Alert className={profileMessage.type === "success" 
                      ? "bg-green-900/20 border-green-800 text-green-400" 
                      : "bg-red-900/20 border-red-800 text-red-400"
                    }>
                      <AlertDescription>{profileMessage.text}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-neutral-200">
                      Nombre Completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <Input
                        id="name"
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="pl-10 bg-[#0f0f0f] border-neutral-700 text-neutral-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-neutral-200">
                      Nombre de Usuario
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <Input
                        id="username"
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        className="pl-10 bg-[#0f0f0f] border-neutral-700 text-neutral-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-neutral-200">
                      Correo Electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="pl-10 bg-[#0f0f0f] border-neutral-700 text-neutral-100"
                        required
                      />
                    </div>
                  </div>

                  <Separator className="bg-neutral-800" />

                  <Button
                    type="submit"
                    disabled={isLoadingProfile}
                    className="w-full bg-[#D89216] hover:bg-[#b6770f] text-black font-semibold"
                  >
                    {isLoadingProfile ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <Card className="bg-[#1a1a1a] border-neutral-800">
              <CardHeader>
                <CardTitle className="text-neutral-100">
                  Cambiar Contraseña
                </CardTitle>
                <CardDescription className="text-neutral-400">
                  Actualiza tu contraseña para mantener tu cuenta segura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  {passwordMessage && (
                    <Alert className={passwordMessage.type === "success" 
                      ? "bg-green-900/20 border-green-800 text-green-400" 
                      : "bg-red-900/20 border-red-800 text-red-400"
                    }>
                      <AlertDescription>{passwordMessage.text}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-neutral-200">
                      Contraseña Actual
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="pl-10 pr-10 bg-[#0f0f0f] border-neutral-700 text-neutral-100"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-neutral-200">
                      Nueva Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="pl-10 pr-10 bg-[#0f0f0f] border-neutral-700 text-neutral-100"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Mínimo 6 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-neutral-200">
                      Confirmar Nueva Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="pl-10 pr-10 bg-[#0f0f0f] border-neutral-700 text-neutral-100"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Separator className="bg-neutral-800" />

                  <Button
                    type="submit"
                    disabled={isLoadingPassword}
                    className="w-full bg-[#D89216] hover:bg-[#b6770f] text-black font-semibold"
                  >
                    {isLoadingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                        Cambiando...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Cambiar Contraseña
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
