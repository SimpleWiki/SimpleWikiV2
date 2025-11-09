import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MessageSquare, User, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function AdminCommentsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !(session.user as any)?.isAdmin) {
    redirect('/auth/login')
  }

  // Get all comments
  const comments = await prisma.comment.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: {
        select: {
          username: true,
          displayName: true,
        },
      },
      page: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
    take: 100, // Limit to last 100 comments
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Modération des commentaires</h1>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {comment.author?.displayName || comment.author?.username || comment.authorName || 'Anonyme'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FileText className="h-4 w-4 mr-1" />
                <Link
                  href={`/wiki/${comment.page.slug}`}
                  className="text-primary-600 hover:text-primary-900"
                >
                  {comment.page.title}
                </Link>
              </div>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap">
              {comment.content}
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Aucun commentaire
          </h3>
        </div>
      )}
    </div>
  )
}
