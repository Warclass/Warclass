'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default function ScorePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const result = parseInt(searchParams.get('result') || '0')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(result)
    }, 500)

    return () => clearTimeout(timer)
  }, [result])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-500'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-500'
    return 'text-red-600 dark:text-red-500'
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return '[&>div]:bg-green-500'
    if (score >= 60) return '[&>div]:bg-yellow-500'
    return '[&>div]:bg-red-500'
  }

  const getMessage = (score: number) => {
    if (score >= 90) return '¡Excelente trabajo! 🎉'
    if (score >= 80) return '¡Muy bien! 👏'
    if (score >= 60) return 'Buen intento 👍'
    return 'Sigue practicando 💪'
  }

  return (
    <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex flex-grow h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-neutral-900 dark:text-white">
            Resultado del Quiz
          </CardTitle>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">{getMessage(result)}</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 p-8">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`text-7xl font-bold ${getScoreColor(result)} animate-pulse`}
              >
                {result}%
              </div>
            </div>
          </div>

          <div className="w-full space-y-2">
            <Progress
              value={progress}
              className={`h-4 ${getProgressColor(result)}`}
            />
            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              Tu puntuación
            </p>
          </div>

          <div className="text-center space-y-2">
            {result >= 60 ? (
              <>
                <p className="text-green-600 dark:text-green-500 font-semibold">
                  ✓ Quiz Aprobado
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Has ganado experiencia y oro
                </p>
              </>
            ) : (
              <>
                <p className="text-red-600 dark:text-red-500 font-semibold">
                  ✗ Quiz No Aprobado
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Intenta de nuevo para mejorar tu puntuación
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col w-full gap-3 pt-4">
            <Button
              onClick={() => router.push('/player/quizzes')}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-neutral-900 font-semibold"
            >
              Volver a Quizzes
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="w-full border-neutral-300 dark:border-neutral-700"
            >
              Ir al Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
