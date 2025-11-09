import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Tags } from 'lucide-react'

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    include: {
      pages: {
        where: {
          page: {
            status: 'published',
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Tags className="w-8 h-8 text-primary-600" />
        <h1 className="text-4xl font-bold">Tags</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {tags.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Aucun tag disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full hover:bg-primary-200 transition-colors"
              >
                <span className="font-medium">{tag.name}</span>
                <span className="text-sm text-primary-600">
                  ({tag.pages.length})
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
