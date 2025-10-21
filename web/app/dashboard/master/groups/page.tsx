'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from "next/image"

interface Student {
  id: string
  name: string
  character: string
  level: number
  gold: number
  experience: number
  energy: number
  health: number
  avatar: string
}

interface PointsFormData {
  studentName: string
  gold: number
  experience: number
}

export default function GroupsPage() {
  const [showAddPointsModal, setShowAddPointsModal] = useState(false)
  const [showRemovePointsModal, setShowRemovePointsModal] = useState(false)
  const [addPointsForm, setAddPointsForm] = useState<PointsFormData>({
    studentName: '',
    gold: 0,
    experience: 0,
  })
  const [removePointsForm, setRemovePointsForm] = useState<PointsFormData>({
    studentName: '',
    gold: 0,
    experience: 0,
  })

  const students: Student[] = [
    {
      id: '1',
      name: 'Chocce, Marcos',
      character: 'Curandero',
      level: 2,
      gold: 100000,
      experience: 1000,
      energy: 1000,
      health: 1000,
      avatar: 'https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-05.jpg',
    },
    {
      id: '2',
      name: 'Torres, Ismael',
      character: 'Guerrero',
      level: 5,
      gold: 50000,
      experience: 2500,
      energy: 800,
      health: 1200,
      avatar: 'https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-05.jpg',
    },
    {
      id: '3',
      name: 'Rojas, Cristian',
      character: 'Mago',
      level: 3,
      gold: 75000,
      experience: 1500,
      energy: 900,
      health: 800,
      avatar: 'https://raw.githubusercontent.com/cruip/vuejs-admin-dashboard-template/main/src/images/user-36-05.jpg',
    },
  ]

  const handleAddPoints = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Adding points:', addPointsForm)
    setShowAddPointsModal(false)
  }

  const handleRemovePoints = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Removing points:', removePointsForm)
    setShowRemovePointsModal(false)
  }

  return (
    <div className="flex w-full flex-col items-center justify-center bg-white dark:bg-black">
      <section className="m-4 flex w-8/12 flex-row items-center gap-3 rounded-md border-2 border-black p-4 dark:border-white">
        <p className="text-xl font-semibold text-neutral-700 dark:text-neutral-100">
          Gestión de miembros:
        </p>

        <Dialog open={showAddPointsModal} onOpenChange={setShowAddPointsModal}>
          <DialogTrigger asChild>
            <Button className="btn-success gap-2 text-lg font-bold">
              <span className="icon-[foundation--plus]" />
              Dar puntos
            </Button>
          </DialogTrigger>
          <DialogContent className="border bg-white p-8 text-black">
            <DialogHeader>
              <DialogTitle className="flex w-full justify-center text-2xl font-bold">
                Dar Puntos
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPoints} className="w-full space-y-4 p-3">
              <div>
                <Label className="mb-2 block text-gray-700">Nombre</Label>
                <Input
                  type="text"
                  placeholder="Name"
                  value={addPointsForm.studentName}
                  onChange={(e) =>
                    setAddPointsForm({ ...addPointsForm, studentName: e.target.value })
                  }
                  className="w-full bg-white"
                  required
                />
              </div>
              <div className="flex flex-row gap-4">
                <div className="flex-1">
                  <Label className="mb-2 block text-gray-700">Oro:</Label>
                  <Input
                    type="number"
                    placeholder="Oro"
                    value={addPointsForm.gold}
                    onChange={(e) =>
                      setAddPointsForm({ ...addPointsForm, gold: Number(e.target.value) })
                    }
                    className="w-full bg-white"
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label className="mb-2 block text-gray-700">Experiencia:</Label>
                  <Input
                    type="number"
                    placeholder="Experiencia"
                    value={addPointsForm.experience}
                    onChange={(e) =>
                      setAddPointsForm({
                        ...addPointsForm,
                        experience: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="btn-success w-full">
                Confirmar
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showRemovePointsModal} onOpenChange={setShowRemovePointsModal}>
          <DialogTrigger asChild>
            <Button className="btn-error gap-2 text-lg font-bold">
              <span className="icon-[streamline--subtract-1-solid]" />
              Quitar puntos
            </Button>
          </DialogTrigger>
          <DialogContent className="border bg-white p-8 text-black">
            <DialogHeader>
              <DialogTitle className="flex w-full justify-center text-2xl font-bold">
                Quitar puntos
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRemovePoints} className="w-full space-y-4 p-3">
              <div>
                <Label className="mb-2 block text-gray-700">Nombre</Label>
                <Input
                  type="text"
                  placeholder="Name"
                  value={removePointsForm.studentName}
                  onChange={(e) =>
                    setRemovePointsForm({ ...removePointsForm, studentName: e.target.value })
                  }
                  className="w-full bg-white"
                  required
                />
              </div>
              <div className="flex flex-row gap-4">
                <div className="flex-1">
                  <Label className="mb-2 block text-gray-700">Oro:</Label>
                  <Input
                    type="number"
                    placeholder="Oro"
                    value={removePointsForm.gold}
                    onChange={(e) =>
                      setRemovePointsForm({ ...removePointsForm, gold: Number(e.target.value) })
                    }
                    className="w-full bg-white"
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label className="mb-2 block text-gray-700">Experiencia:</Label>
                  <Input
                    type="number"
                    placeholder="Experiencia"
                    value={removePointsForm.experience}
                    onChange={(e) =>
                      setRemovePointsForm({
                        ...removePointsForm,
                        experience: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="btn-error w-full">
                Confirmar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <section className="h-[33rem] w-8/12 flex flex-col items-center overflow-x-scroll border-2 border-neutral-500 scrollbar-none dark:bg-black">
        <div className="h-full w-full rounded-sm px-4 py-2 text-black shadow-lg">
          <header className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-2xl font-bold text-yellow-600">Grupo 1</h2>
          </header>
          <div className="p-3">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-neutral-700 text-xs font-semibold uppercase text-yellow-500">
                  <TableRow className="border-2 border-black">
                    <TableHead className="p-4 text-left text-sm font-semibold">
                      Alumno
                    </TableHead>
                    <TableHead className="p-4 text-left text-sm font-semibold">
                      Personaje
                    </TableHead>
                    <TableHead className="p-4 text-left text-sm font-semibold">
                      Nivel
                    </TableHead>
                    <TableHead className="p-4 text-center text-sm font-semibold">
                      Oro
                    </TableHead>
                    <TableHead className="p-4 text-center text-sm font-semibold">
                      Experiencia
                    </TableHead>
                    <TableHead className="p-4 text-center text-sm font-semibold">
                      Energía
                    </TableHead>
                    <TableHead className="p-4 text-center text-sm font-semibold">
                      Vida
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 border-2 border-black text-sm text-neutral-600 dark:text-white">
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="p-2">
                        <div className="flex items-center">
                          <div className="mr-2 h-10 w-10 flex-shrink-0 sm:mr-3">
                            <Image
                              className="rounded-full"
                              src={student.avatar}
                              alt={student.name}
                              width={40}
                              height={40}
                            />
                          </div>
                          <div className="font-medium">{student.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="p-2 text-left">{student.character}</TableCell>
                      <TableCell className="p-2 text-left font-medium text-green-500">
                        {student.level}
                      </TableCell>
                      <TableCell className="p-2 text-center text-lg">
                        {student.gold.toLocaleString()}
                      </TableCell>
                      <TableCell className="p-2 text-center text-lg">
                        {student.experience}
                      </TableCell>
                      <TableCell className="p-2 text-center text-lg">
                        {student.energy}
                      </TableCell>
                      <TableCell className="p-2 text-center text-lg">
                        {student.health}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
