import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { User } from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: parseInt((session.user as any).id),
    },
    include: {
      pages: {
        where: {
          status: 'published',
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: 5,
      },
      _count: {
        select: {
          pages: true,
          comments: true,
        },
      },
    },
  })

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-primary-600" />
        <h1 className="text-4xl font-bold">Mon Profil</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-6">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName || user.username}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-12 h-12 text-primary-600" />
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {user.displayName || user.username}
            </h2>
            <p className="text-gray-600">@{user.username}</p>
            {user.email && (
              <p className="text-gray-600 mt-2">{user.email}</p>
            )}

            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-2xl font-bold text-primary-600">
                  {user._count.pages}
                </p>
                <p className="text-sm text-gray-600">Pages</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600">
                  {user._count.comments}
                </p>
                <p className="text-sm text-gray-600">Commentaires</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Mes pages récentes</h2>
          <Link
            href="/wiki/new"
            className="text-primary-600 hover:text-primary-700"
          >
            Nouvelle page
          </Link>
        </div>

        {user.pages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Vous n'avez pas encore créé de pages.
            </p>
            <Link
              href="/wiki/new"
              className="inline-block mt-4 text-primary-600 hover:text-primary-700 underline"
            >
              Créer votre première page
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {user.pages.map((page) => (
              <div
                key={page.id}
                className="border-b border-gray-200 pb-4 last:border-0"
              >
                <Link
                  href={`/wiki/${page.slug}`}
                  className="text-lg font-medium text-primary-600 hover:text-primary-700"
                >
                  {page.title}
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  Publié le{' '}
                  {page.publishedAt
                    ? new Date(page.publishedAt).toLocaleDateString('fr-FR')
                    : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
