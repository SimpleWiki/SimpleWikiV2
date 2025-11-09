import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Users, FileText, MessageSquare, Tags } from 'lucide-react'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || !(session.user as any)?.isAdmin) {
    redirect('/auth/login')
  }

  // Get stats
  const [userCount, pageCount, commentCount, tagCount] = await Promise.all([
    prisma.user.count(),
    prisma.page.count(),
    prisma.comment.count(),
    prisma.tag.count(),
  ])

  const stats = [
    {
      name: 'Utilisateurs',
      value: userCount,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Pages',
      value: pageCount,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      name: 'Commentaires',
      value: commentCount,
      icon: MessageSquare,
      color: 'bg-purple-500',
    },
    {
      name: 'Tags',
      value: tagCount,
      icon: Tags,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Administration</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Gestion</h2>
          <ul className="space-y-2">
            <li>
              <a
                href="/admin/users"
                className="text-primary-600 hover:text-primary-700"
              >
                Gérer les utilisateurs
              </a>
            </li>
            <li>
              <a
                href="/admin/pages"
                className="text-primary-600 hover:text-primary-700"
              >
                Gérer les pages
              </a>
            </li>
            <li>
              <a
                href="/admin/comments"
                className="text-primary-600 hover:text-primary-700"
              >
                Modérer les commentaires
              </a>
            </li>
            <li>
              <a
                href="/admin/roles"
                className="text-primary-600 hover:text-primary-700"
              >
                Gérer les rôles
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Configuration</h2>
          <ul className="space-y-2">
            <li>
              <a
                href="/admin/settings"
                className="text-primary-600 hover:text-primary-700"
              >
                Paramètres du site
              </a>
            </li>
            <li>
              <a
                href="/admin/badges"
                className="text-primary-600 hover:text-primary-700"
              >
                Gérer les badges
              </a>
            </li>
            <li>
              <a
                href="/admin/reactions"
                className="text-primary-600 hover:text-primary-700"
              >
                Gérer les réactions
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
