import { prisma } from '@/lib/prisma'
import { PageCard } from '@/components/PageCard'
import Link from 'next/link'

export default async function HomePage() {
  const pages = await prisma.page.findMany({
    where: {
      status: 'published',
    },
    include: {
      author: {
        select: {
          username: true,
          displayName: true,
          avatar: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 20,
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Bienvenue sur SimpleWiki</h1>
        <Link
          href="/wiki/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Nouvelle page
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <PageCard key={page.id} page={page} />
        ))}
      </div>

      {pages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Aucune page publiée pour le moment.
          </p>
          <Link
            href="/wiki/new"
            className="inline-block mt-4 text-primary-600 hover:text-primary-700 underline"
          >
            Créer la première page
          </Link>
        </div>
      )}
    </div>
  )
}
