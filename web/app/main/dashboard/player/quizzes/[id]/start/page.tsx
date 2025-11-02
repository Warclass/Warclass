'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const quizData = {
  1: {
    title: 'Examen 1',
    questions: [
      {
        id: 1,
        question: '¿Cuál es la capital de Francia?',
        answers: ['París', 'Londres', 'Berlín', 'Madrid'],
        correctAnswer: 'París',
      },
      {
        id: 2,
        question: '¿En qué año llegó el hombre a la luna?',
        answers: ['1965', '1969', '1972', '1975'],
        correctAnswer: '1969',
      },
      {
        id: 3,
        question: '¿Cuál es el planeta más grande del sistema solar?',
        answers: ['Tierra', 'Marte', 'Júpiter', 'Saturno'],
        correctAnswer: 'Júpiter',
      },
    ],
  },
}

export default function QuizStartPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string
  const quiz = quizData[Number(quizId) as keyof typeof quizData]

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})

  const handleAnswerChange = (questionId: number, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let correctCount = 0
    quiz.questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / quiz.questions.length) * 100)

    router.push(`/player/score?result=${score}`)
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-neutral-600 dark:text-neutral-400">Quiz no encontrado</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-950 w-full min-h-screen flex justify-center items-center p-4">
      <Card className="w-full max-w-4xl border-neutral-200 dark:border-neutral-800">
        <CardHeader className="border-b-2 border-neutral-200 dark:border-neutral-800 bg-yellow-500">
          <CardTitle className="text-4xl font-bold text-center text-neutral-900">
            {quiz.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <div className="flex justify-between items-center bg-red-500 text-white p-4 rounded-t-lg">
                    <h3 className="text-2xl font-semibold">Pregunta {index + 1}</h3>
                    <span className="text-xl font-semibold">2 pts</span>
                  </div>

                  <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardContent className="p-6 space-y-4">
                      <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                        {question.question}
                      </h2>

                      <RadioGroup
                        value={selectedAnswers[question.id] || ''}
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                        required
                      >
                        {question.answers.map((answer, answerIndex) => (
                          <div key={answerIndex} className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={answer}
                                id={`q${question.id}-a${answerIndex}`}
                              />
                              <Label
                                htmlFor={`q${question.id}-a${answerIndex}`}
                                className="text-base cursor-pointer text-neutral-700 dark:text-neutral-300"
                              >
                                {answer}
                              </Label>
                            </div>
                            <Separator className="w-3/4 bg-neutral-200 dark:bg-neutral-700" />
                          </div>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </div>
              ))}

              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-neutral-900 font-bold text-xl px-12 py-6"
                  disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
                >
                  Entregar Quiz
                </Button>
              </div>
            </form>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
