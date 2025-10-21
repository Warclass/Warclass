import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function CreateCoursePage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-base-300 text-neutral-700 dark:text-neutral-100">
      <h1 className="text-5xl font-semibold">Create Course</h1>
      
      <Card className="w-full max-w-2xl dark:bg-neutral-800">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-yellow-500">
            Detalles de Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/courses" method="POST" className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-xl">
                Course name:
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="Ingrese el nombre del curso"
                className="input-warning w-full"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description" className="text-xl">
                Description:
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Ingrese Descripcion del curso"
                className="h-32 textarea-warning"
                required
              />
            </div>

            <input type="hidden" name="id_institution" value="" />

            <Button type="submit" className="btn-accent w-full">
              <span className="text-xl text-white">Guardar</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
