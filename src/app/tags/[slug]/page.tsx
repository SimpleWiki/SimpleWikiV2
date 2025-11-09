import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Tags, ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { PageCard } from '@/components/PageCard'

interface Props {
  params: {
    slug: string
  }
}

export default async function TagPage({ params }: Props) {
  const tag = await prisma.tag.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      pages: {
        where: {
          page: {
            status: 'published',
          },
        },
        include: {
          page: {
            include: {
              author: {
                select: {
                  username: true,
                  displayName: true,
                },
              },
              _count: {
                select: {
                  comments: true,
                },
              },
            },
          },
        },
        orderBy: {
          page: {
            createdAt: 'desc',
          },
        },
      },
    },
  })

  if (!tag) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/tags"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux tags
        </Link>
        <div className="flex items-center gap-3">
          <Tags className="w-8 h-8 text-primary-600" />
          <h1 className="text-4xl font-bold">{tag.name}</h1>
          <span className="text-gray-500 text-lg">
            ({tag.pages.length} page{tag.pages.length !== 1 ? 's' : ''})
          </span>
        </div>
      </div>

      {tag.pages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Tags className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune page avec ce tag
          </h3>
          <p className="text-gray-500">
            Il n'y a pas encore de pages associées à ce tag.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tag.pages.map((pageTag) => (
            <PageCard key={pageTag.page.id} page={pageTag.page} />
          ))}
        </div>
      )}
    </div>
  )
}
