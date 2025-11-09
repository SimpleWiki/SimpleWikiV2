import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Award, Star, Trophy, Target, Zap, Heart } from 'lucide-react'

export default async function AdminBadgesPage() {
  const session = await getServerSession(authOptions)

  if (!session || !(session.user as any)?.isAdmin) {
    redirect('/auth/login')
  }

  const badges = [
    {
      name: 'Premier contributeur',
      description: 'Créer sa première page wiki',
      icon: Star,
      color: 'bg-yellow-100 text-yellow-600',
      criteria: '1 page créée',
    },
    {
      name: 'Contributeur actif',
      description: 'Créer 10 pages wiki',
      icon: Trophy,
      color: 'bg-blue-100 text-blue-600',
      criteria: '10 pages créées',
    },
    {
      name: 'Expert',
      description: 'Créer 50 pages wiki',
      icon: Award,
      color: 'bg-purple-100 text-purple-600',
      criteria: '50 pages créées',
    },
    {
      name: 'Populaire',
      description: 'Recevoir 100 likes',
      icon: Heart,
      color: 'bg-pink-100 text-pink-600',
      criteria: '100 likes reçus',
    },
    {
      name: 'Commentateur',
      description: 'Poster 50 commentaires',
      icon: Target,
      color: 'bg-green-100 text-green-600',
      criteria: '50 commentaires postés',
    },
    {
      name: 'Super contributeur',
      description: 'Être dans le top 10 des contributeurs',
      icon: Zap,
      color: 'bg-orange-100 text-orange-600',
      criteria: 'Top 10 contributeurs',
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Gestion des badges</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => (
          <div key={badge.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${badge.color}`}>
                <badge.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{badge.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {badge.description}
                </p>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {badge.criteria}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Les badges sont automatiquement attribués aux
          utilisateurs lorsqu'ils remplissent les critères. Cette page permet
          de visualiser tous les badges disponibles.
        </p>
      </div>
    </div>
  )
}
