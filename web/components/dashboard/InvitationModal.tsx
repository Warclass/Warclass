"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2, Copy, Check } from "lucide-react";

interface InvitationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName: string;
  userId: string;
}

export function InvitationModal({ open, onOpenChange, courseId, courseName, userId }: InvitationModalProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "El nombre o email del invitado es requerido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          courseId,
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la invitación");
      }

      setGeneratedCode(data.data.code);
      toast({
        title: "¡Invitación creada!",
        description: "El código de invitación ha sido generado exitosamente",
      });
    } catch (error) {
      console.error("Error creating invitation:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear la invitación",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast({
        title: "¡Código copiado!",
        description: "El código de invitación ha sido copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName("");
    setGeneratedCode(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1a1a1a] border-neutral-800 text-neutral-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-100">
            Enviar Invitación
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Curso: <span className="text-[#D89216] font-semibold">{courseName}</span>
          </DialogDescription>
        </DialogHeader>

        {!generatedCode ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-neutral-300">
                Nombre o Email del Invitado <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Juan Pérez o juan@example.com"
                className="bg-[#0f0f0f] border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
                disabled={isLoading}
                maxLength={100}
              />
              <p className="text-xs text-neutral-500">
                Este nombre se mostrará al usuario en su lista de invitaciones
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="bg-[#D89216] hover:bg-[#b6770f] text-black"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Generar Código
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#0f0f0f] border border-neutral-800 rounded-lg p-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-neutral-400 mb-2">Código de Invitación</p>
                <div className="text-4xl font-bold text-[#D89216] tracking-wider font-mono">
                  {generatedCode}
                </div>
              </div>

              <Button
                onClick={handleCopyCode}
                className="w-full bg-[#D89216] hover:bg-[#b6770f] text-black"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Código
                  </>
                )}
              </Button>
            </div>

            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <p className="text-sm text-neutral-300">
                <strong className="text-blue-400">Nota:</strong> Comparte este código con el
                estudiante para que pueda unirse al curso. El código es de un solo uso.
              </p>
            </div>

            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
