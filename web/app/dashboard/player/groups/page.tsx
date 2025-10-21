import PlayerLayout from '@/app/layouts/PlayerLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'

const groupMembers = [
  {
    id: 1,
    name: 'Chocce, Marcos',
    avatar: '/img/user01.jpeg',
    character: 'Mago',
    level: 35,
    gold: 1250,
    experience: 85,
    energy: 70,
    health: 95,
  },
  {
    id: 2,
    name: 'Torres, Ismael',
    avatar: '/img/user02.jpg',
    character: 'Guerrero',
    level: 28,
    gold: 980,
    experience: 65,
    energy: 85,
    health: 100,
  },
  {
    id: 3,
    name: 'Rojas, Cristian',
    avatar: '/img/user03.jpg',
    character: 'Elfo',
    level: 32,
    gold: 1100,
    experience: 78,
    energy: 60,
    health: 88,
  },
  {
    id: 4,
    name: 'Jimenez, Pedro',
    avatar: '/img/user04.jpg',
    character: 'Mago',
    level: 25,
    gold: 750,
    experience: 55,
    energy: 90,
    health: 75,
  },
  {
    id: 5,
    name: 'Lopez, Tomas',
    avatar: '/img/user05.jpg',
    character: 'Guerrero',
    level: 18,
    gold: 520,
    experience: 35,
    energy: 50,
    health: 60,
  },
  {
    id: 6,
    name: 'Sanches, Karen',
    avatar: '/img/user06.jpeg',
    character: 'Elfo',
    level: 40,
    gold: 1580,
    experience: 95,
    energy: 80,
    health: 92,
  },
]

export default function GroupsPage() {
  return (
    <PlayerLayout name="Grupos" token="temp-token">
      <div className="w-full flex flex-col items-center">
      <Card className="w-full max-w-6xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-2xl">
        <CardHeader className="border-b border-neutral-200 dark:border-neutral-800">
          <CardTitle className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">
            Grupo 1
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-700 hover:bg-neutral-700">
                  <TableHead className="text-yellow-500 font-semibold">Alumno</TableHead>
                  <TableHead className="text-yellow-500 font-semibold">Personaje</TableHead>
                  <TableHead className="text-yellow-500 font-semibold">Nivel</TableHead>
                  <TableHead className="text-yellow-500 font-semibold text-center">Oro</TableHead>
                  <TableHead className="text-yellow-500 font-semibold text-center">
                    Experiencia
                  </TableHead>
                  <TableHead className="text-yellow-500 font-semibold text-center">
                    Energía
                  </TableHead>
                  <TableHead className="text-yellow-500 font-semibold text-center">Vida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupMembers.map((member) => (
                  <TableRow
                    key={member.id}
                    className="border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {member.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-700 dark:text-neutral-300">
                      {member.character}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Nvl {member.level}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold text-yellow-600 dark:text-yellow-500">
                        {member.gold} 🪙
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="w-full space-y-1">
                        <Progress value={member.experience} className="h-2" />
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">
                          {member.experience}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-full space-y-1">
                        <Progress value={member.energy} className="h-2 [&>div]:bg-blue-500" />
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">
                          {member.energy}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-full space-y-1">
                        <Progress value={member.health} className="h-2 [&>div]:bg-green-500" />
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">
                          {member.health}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      </div>
    </PlayerLayout>
  )
}
