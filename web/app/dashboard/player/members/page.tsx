import PlayerLayout from '@/app/layouts/PlayerLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const members = [
  {
    id: 1,
    name: 'Chooce Marcos',
    avatar: '/img/user01.jpeg',
    level: 35,
    experience: 50,
    health: 50,
  },
  {
    id: 2,
    name: 'Torres Ismael',
    avatar: '/img/user02.jpg',
    level: 20,
    experience: 75,
    health: 30,
  },
  {
    id: 3,
    name: 'Rojas Cristian',
    avatar: '/img/user03.jpg',
    level: 20,
    experience: 75,
    health: 30,
  },
  {
    id: 4,
    name: 'Jimenez Pedro',
    avatar: '/img/user04.jpg',
    level: 20,
    experience: 75,
    health: 30,
  },
  {
    id: 5,
    name: 'Lopez Tomas',
    avatar: '/img/user05.jpg',
    level: 15,
    experience: 20,
    health: 100,
  },
  {
    id: 6,
    name: 'Sanches Karen',
    avatar: '/img/user06.jpeg',
    level: 40,
    experience: 90,
    health: 60,
  },
]

export default function MembersPage() {
  return (
    <PlayerLayout name="Miembros" token="temp-token">
    <section className="mx-auto px-4 sm:px-6 lg:px-8 py-14 bg-white dark:bg-neutral-950 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">Miembros del Grupo</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Visualiza el progreso de todos los miembros
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {members.map((member) => (
          <Card
            key={member.id}
            className="hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer border-neutral-200 dark:border-neutral-800"
          >
            <CardContent className="p-6 flex flex-col justify-center items-center space-y-3">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center text-xs">
                <p className="text-neutral-900 dark:text-white font-bold mb-1">
                  {member.name} -{' '}
                  <span className="text-pink-600 dark:text-pink-500">Nvl {member.level}</span>
                </p>

                <div className="space-y-1 mb-2">
                  <Progress value={member.experience} className="h-2 [&>div]:bg-green-500" />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Experiencia: {member.experience}%
                  </p>
                </div>

                <div className="space-y-1">
                  <Progress value={member.health} className="h-2 [&>div]:bg-red-500" />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Vida: {member.health}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
    </PlayerLayout>
  )
}
