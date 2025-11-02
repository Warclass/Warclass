import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface Member {
  id: string
  name: string
  level: number
  experienceProgress: number
  healthProgress: number
  icon: string
}

export default function MembersPage() {
  const members: Member[] = [
    {
      id: '1',
      name: 'Chocce Marcos',
      level: 35,
      experienceProgress: 50,
      healthProgress: 50,
      icon: 'icon-[twemoji--man-pouting-medium-light-skin-tone]',
    },
    {
      id: '2',
      name: 'Torres Ismael',
      level: 20,
      experienceProgress: 75,
      healthProgress: 30,
      icon: 'icon-[twemoji--man-pouting-medium-light-skin-tone]',
    },
    {
      id: '3',
      name: 'Rojas Cristian',
      level: 20,
      experienceProgress: 75,
      healthProgress: 30,
      icon: 'icon-[twemoji--man-pouting-medium-light-skin-tone]',
    },
    {
      id: '4',
      name: 'Jimenez Pedro',
      level: 20,
      experienceProgress: 75,
      healthProgress: 30,
      icon: 'icon-[twemoji--man-pouting-medium-light-skin-tone]',
    },
    {
      id: '5',
      name: 'Lopez Tomas',
      level: 15,
      experienceProgress: 20,
      healthProgress: 100,
      icon: 'icon-[twemoji--man-pouting-medium-light-skin-tone]',
    },
    {
      id: '6',
      name: 'Sanches Karen',
      level: 40,
      experienceProgress: 90,
      healthProgress: 60,
      icon: 'icon-[twemoji--woman-pouting-medium-light-skin-tone]',
    },
  ]

  return (
    <section className="mx-auto px-4 py-14 sm:px-6 lg:px-6">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {members.map((member) => (
          <Card
            key={member.id}
            className="flex h-full w-full flex-col items-center justify-center rounded-lg p-12 shadow-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <div className="mb-3">
              <span className={`${member.icon} h-16 w-16 rounded-full object-cover object-center`} />
            </div>
            <div className="text-center text-xs">
              <p className="mb-2 font-bold text-black dark:text-white">
                {member.name} - <span className="text-pink-600">Nvl {member.level}</span>
              </p>
              <Progress
                value={member.experienceProgress}
                className="mb-1 progress-success"
              />
              <Progress
                value={member.healthProgress}
                className="progress-error"
              />
            </div>
          </Card>
        ))}

        <Button
          variant="ghost"
          className="btn-ghost flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg p-12 shadow-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
        >
          <div className="mb-3 flex flex-col items-center gap-2">
            <span className="icon-[subway--add] h-16 w-16 rounded-full object-cover object-center" />
            <p className="text-center text-xl font-bold dark:text-neutral-200">
              add new players
            </p>
          </div>
        </Button>
      </div>
    </section>
  )
}
