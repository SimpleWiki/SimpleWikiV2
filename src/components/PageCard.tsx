import Link from 'next/link'
import { formatDate, truncate } from '@/lib/utils'
import { Eye, Heart, Calendar } from 'lucide-react'

interface PageCardProps {
  page: any
}

export function PageCard({ page }: PageCardProps) {
  return (
    <Link
      href={`/wiki/${page.slug}`}
      className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
    >
      <h2 className="text-xl font-bold mb-2 text-gray-900 hover:text-primary-600">
        {page.title}
      </h2>

      <p className="text-gray-600 mb-4 line-clamp-3">
        {truncate(page.content.replace(/[#*`]/g, ''), 150)}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{page.views || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span>{page.likes || 0}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(page.publishedAt || page.createdAt)}</span>
        </div>
      </div>

      {page.tags && page.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {page.tags.map((pt: any) => (
            <span
              key={pt.tag.id}
              className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs"
            >
              {pt.tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Par {page.author?.displayName || page.author?.username}
      </div>
    </Link>
  )
}
