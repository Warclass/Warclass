'use client'

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Student {
  id: string
  name: string
}

interface Group {
  id: string
  name: string
  avatar: string
  students: Student[]
}

export default function CreateGroupPage() {
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([
    { id: '1', name: 'nombre alumno' },
    { id: '2', name: 'nombre alumno' },
    { id: '3', name: 'nombre alumno' },
    { id: '4', name: 'nombre alumno' },
    { id: '5', name: 'nombre alumno' },
  ])

  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'Equipo 1',
      avatar: '/img/insignia1.jpg',
      students: [
        { id: '6', name: 'nombre alumno' },
        { id: '7', name: 'nombre alumno' },
      ],
    },
    {
      id: '2',
      name: 'Equipo 2',
      avatar: '/img/insignia1.jpg',
      students: [],
    },
  ])

  const handleDragStart = (e: React.DragEvent, student: Student, fromGroup?: string) => {
    e.dataTransfer.setData('student', JSON.stringify(student))
    e.dataTransfer.setData('fromGroup', fromGroup || 'unassigned')
  }

  const handleDrop = (e: React.DragEvent, targetGroupId?: string) => {
    e.preventDefault()
    const student = JSON.parse(e.dataTransfer.getData('student')) as Student
    const fromGroup = e.dataTransfer.getData('fromGroup')

    if (fromGroup === 'unassigned') {
      setUnassignedStudents(prev => prev.filter(s => s.id !== student.id))
    } else {
      setGroups(prev =>
        prev.map(g =>
          g.id === fromGroup
            ? { ...g, students: g.students.filter(s => s.id !== student.id) }
            : g
        )
      )
    }

    if (targetGroupId) {
      setGroups(prev =>
        prev.map(g =>
          g.id === targetGroupId
            ? { ...g, students: [...g.students, student] }
            : g
        )
      )
    } else {
      setUnassignedStudents(prev => [...prev, student])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const addNewGroup = () => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name: `Equipo ${groups.length + 1}`,
      avatar: '/img/insignia1.jpg',
      students: [],
    }
    setGroups([...groups, newGroup])
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-neutral-800">
      <section className="flex h-30 items-center justify-center p-2">
        <div className="flex flex-col items-center space-y-2 p-2">
          <h2 className="text-2xl font-semibold text-black dark:text-white">
            Crear grupos
          </h2>
          <p className="text-neutral-600 dark:text-neutral-200">
            Arastar y soltar alumnos en los grupos
          </p>
        </div>
      </section>

      <section className="flex h-full w-full flex-col gap-2 overflow-auto p-2">
        <div className="flex h-full w-full flex-row gap-2 rounded-md border-2 border-yellow-600 p-2 px-2">
          <div className="flex w-4/12 flex-col gap-2 border-r-2 border-yellow-500 p-2">
            <div className="flex h-20 items-center justify-center">
              <p className="text-2xl font-semibold text-black dark:text-white">
                Alumnos no asignados
              </p>
            </div>

            <div
              className="flex h-full flex-col gap-2 overflow-auto justify-center p-2"
              onDrop={(e) => handleDrop(e)}
              onDragOver={handleDragOver}
            >
              {unassignedStudents.map((student) => (
                <div
                  key={student.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, student)}
                  className="w-full cursor-move rounded-md border-2 border-black bg-white p-2 text-black hover:bg-gray-100"
                >
                  {student.name}
                </div>
              ))}
            </div>
          </div>

          <div className="grid h-[32rem] w-full grid-cols-2 items-center gap-2 overflow-auto p-2 text-black dark:text-neutral-100">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="flex min-h-60 w-full flex-col gap-2 border-2 border-black bg-white p-2 dark:border-neutral-300 dark:bg-neutral"
                onDrop={(e) => handleDrop(e, group.id)}
                onDragOver={handleDragOver}
              >
                <div className="flex flex-row items-center justify-between">
                  <div className="avatar">
                    <div className="w-16 rounded-full">
                      <Image
                        className="h-16 w-16 rounded-full object-cover object-center"
                        src={group.avatar}
                        alt="team avatar"
                        width={64}
                        height={64}
                      />
                    </div>
                  </div>
                  <div className="flex w-full gap-2 p-2">
                    <Input
                      type="text"
                      value={group.name}
                      onChange={(e) =>
                        setGroups(prev =>
                          prev.map(g =>
                            g.id === group.id ? { ...g, name: e.target.value } : g
                          )
                        )
                      }
                      className="w-full border-0 border-b-2 bg-transparent focus:border-transparent"
                    />
                    <button className="btn icon-[ooui--edit] text-neutral-600 dark:hover:bg-neutral-100" />
                  </div>
                </div>
                <div className="flex h-full flex-grow flex-col items-center justify-center gap-2 p-2 text-neutral-500">
                  {group.students.length > 0 ? (
                    group.students.map((student) => (
                      <div
                        key={student.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, student, group.id)}
                        className="w-full cursor-move rounded-md border-2 border-black bg-white p-2 text-black hover:bg-gray-100"
                      >
                        {student.name}
                      </div>
                    ))
                  ) : (
                    <p>Arastrar un jugador</p>
                  )}
                </div>
              </Card>
            ))}

            <Button
              onClick={addNewGroup}
              className="btn flex min-h-60 w-full flex-col gap-2 border-2 border-black bg-white p-2 hover:border-yellow-500 hover:bg-neutral-100 dark:border-neutral-300 dark:bg-neutral dark:hover:border-neutral-300 dark:hover:bg-neutral-600"
            >
              <div className="flex h-full flex-grow flex-row items-center justify-center gap-2 p-2 text-neutral-500">
                <span className="icon-[gridicons--add] text-4xl" />
                <p className="text-xl">Crear nuevo grupo</p>
              </div>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
