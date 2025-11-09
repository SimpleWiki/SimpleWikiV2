import { prisma } from '@/lib/prisma'
import { renderMarkdown } from '@/lib/markdown'
import { formatDateTime } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Eye, Calendar, User, Edit } from 'lucide-react'

interface PageProps {
  params: {
    slug: string
  }
}

export default async function WikiPage({ params }: PageProps) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
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
  })

  if (!page || page.status !== 'published') {
    notFound()
  }

  // Increment views
  await prisma.page.update({
    where: { id: page.id },
    data: { views: { increment: 1 } },
  })

  const htmlContent = renderMarkdown(page.content)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">{page.title}</h1>
          <Link
            href={`/wiki/${page.slug}/edit`}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
          >
            <Edit className="w-4 h-4" />
            <span>Éditer</span>
          </Link>
        </div>

        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6 pb-6 border-b">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>{page.author?.displayName || page.author?.username}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDateTime(page.publishedAt || page.createdAt)}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>{page.views} vues</span>
          </div>
        </div>

        {page.tags && page.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {page.tags.map((pt) => (
              <Link
                key={pt.tag.id}
                href={`/tags/${pt.tag.name}`}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm hover:bg-primary-200"
              >
                {pt.tag.name}
              </Link>
            ))}
          </div>
        )}

        <div
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <div className="mt-12 pt-6 border-t">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
