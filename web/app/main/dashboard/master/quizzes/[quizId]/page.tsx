import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface QuizPageProps {
  params: {
    quizId: string
  }
}

export default function QuizPage({ params }: QuizPageProps) {
  console.log('Quiz ID:', params.quizId)
  const quizName = "Nombre de Quizzes"
  const instructions = "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eum provident minima reiciendis at ab, rerum pariatur accusantium, blanditiis quo consequuntur neque? Totam, eos ducimus. Quod similique eaque vitae sit dolorem!"

  return (
    <div className="flex w-full flex-col items-center gap-2 bg-white text-black dark:bg-neutral-900 dark:text-white">
      <section className="flex w-3/6 flex-col space-y-2 px-4 py-2">
        <div className="p-2">
          <h2 className="text-2xl font-bold">{quizName}</h2>
        </div>
        <div className="h-32 border-y-2 border-black p-2 dark:border-white">
          <h2 className="text-2xl text-neutral-400">Aca va algo.......</h2>
        </div>
      </section>

      <section className="flex w-3/6 flex-col space-y-2 border-2 border-black px-4 py-2 dark:border-white">
        <Card className="border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{instructions}</p>
            <div className="space-y-2">
              <Separator className="w-3/6 border-2 border-black dark:border-white" />
              <Separator className="w-3/6 border-2 border-black dark:border-white" />
              <Separator className="w-3/6 border-2 border-black dark:border-white" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex w-3/6 flex-col space-y-2 px-4 py-2">
        <div className="flex justify-end p-2">
          <Button className="bg-yellow-500 hover:bg-yellow-400">
            <p className="text-lg">Realizar</p>
          </Button>
        </div>
      </section>
    </div>
  )
}
