import Link from 'next/link'
import PlayerLayout from '@/app/layouts/PlayerLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const availableQuizzes = [
  {
    id: 1,
    title: 'Examen 1',
    description: 'Evaluación sobre los conceptos básicos del curso',
    questions: 10,
    timeLimit: 30,
  },
  {
    id: 2,
    title: 'Examen 2',
    description: 'Evaluación intermedia',
    questions: 15,
    timeLimit: 45,
  },
  {
    id: 3,
    title: 'Examen Final',
    description: 'Evaluación final del curso',
    questions: 20,
    timeLimit: 60,
  },
]

export default function QuizzesPage() {
  return (
    <PlayerLayout name="Quizzes" token="temp-token">
    <div className="bg-white dark:bg-neutral-950 w-full min-h-screen flex justify-center flex-col gap-6 items-center py-10">
      <section className="w-full max-w-3xl px-4">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">Quizzes</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Evalúa tus conocimientos y gana experiencia
        </p>
      </section>

      <Card className="w-full max-w-3xl border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-xl text-neutral-900 dark:text-white">📋 Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-neutral-700 dark:text-neutral-300">
            Lee atentamente las preguntas y selecciona una respuesta. El resultado del examen
            saldrá al terminar de responder.
          </p>
          <div className="space-y-2">
            <Separator className="w-3/6 bg-neutral-300 dark:bg-neutral-700" />
            <Separator className="w-3/6 bg-neutral-300 dark:bg-neutral-700" />
            <Separator className="w-3/6 bg-neutral-300 dark:bg-neutral-700" />
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-3xl border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
            🎯 Quizzes Disponibles
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-400">
            Selecciona un quiz para comenzar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 dark:border-neutral-800 pb-4 last:border-0 last:pb-0 gap-3"
            >
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {quiz.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {quiz.description}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                  <span>📝 {quiz.questions} preguntas</span>
                  <span>⏱️ {quiz.timeLimit} minutos</span>
                </div>
              </div>
              <Link href={`/player/quizzes/${quiz.id}/start`}>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-neutral-900 font-semibold">
                  Realizar Quiz
                </Button>
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
    </PlayerLayout>
  )
}
