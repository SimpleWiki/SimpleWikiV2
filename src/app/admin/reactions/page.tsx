import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Smile } from 'lucide-react'

export default async function AdminReactionsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !(session.user as any)?.isAdmin) {
    redirect('/auth/login')
  }

  const reactions = [
    { emoji: '👍', name: 'Like', count: 0 },
    { emoji: '❤️', name: 'Love', count: 0 },
    { emoji: '😂', name: 'Funny', count: 0 },
    { emoji: '😮', name: 'Wow', count: 0 },
    { emoji: '🎉', name: 'Celebrate', count: 0 },
    { emoji: '🤔', name: 'Thinking', count: 0 },
    { emoji: '👎', name: 'Dislike', count: 0 },
    { emoji: '😢', name: 'Sad', count: 0 },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Gestion des réactions</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Smile className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Réactions disponibles
            </h2>
            <p className="text-sm text-gray-500">
              Les utilisateurs peuvent réagir aux pages et commentaires avec ces
              émojis
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reactions.map((reaction) => (
          <div
            key={reaction.name}
            className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-2">{reaction.emoji}</div>
            <div className="font-medium text-gray-900">{reaction.name}</div>
            <div className="text-sm text-gray-500 mt-1">
              {reaction.count} utilisations
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Les réactions permettent aux utilisateurs
          d'exprimer rapidement leur sentiment sur une page ou un commentaire.
          Cette fonctionnalité améliore l'engagement et l'interaction au sein de
          la communauté.
        </p>
      </div>
    </div>
  )
}
