'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface CreateInvitationPageProps {
  params: {
    courseId: string
  }
}

export default function CreateInvitationPage({ params }: CreateInvitationPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Creating invitation:', {
      ...formData,
      courseId: params.courseId,
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-300 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Crear invitación para el curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name" className="font-medium">
                Nombre:
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-gray-300 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email" className="font-medium">
                Email:
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-gray-300 focus:ring-blue-500"
                required
              />
            </div>

            <input type="hidden" name="id_course" value={params.courseId} />

            <Button
              type="submit"
              className="w-full bg-gray-200 font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600"
            >
              Guardar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
