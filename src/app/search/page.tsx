'use client'

import { useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt: string
  author: {
    username: string
    displayName: string | null
  }
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <SearchIcon className="w-8 h-8 text-primary-600" />
        <h1 className="text-4xl font-bold">Recherche</h1>
      </div>

      <form onSubmit={handleSearch} className="max-w-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher des pages..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </form>

      {hasSearched && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Recherche en cours...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Aucun résultat trouvé pour "{query}"
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600">
                {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
              </p>
              <div className="space-y-4">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                  >
                    <Link
                      href={`/wiki/${result.slug}`}
                      className="text-xl font-bold text-primary-600 hover:text-primary-700"
                    >
                      {result.title}
                    </Link>
                    <p className="text-gray-600 mt-2">{result.excerpt}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Par {result.author.displayName || result.author.username}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
