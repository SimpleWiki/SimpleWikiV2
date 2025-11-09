'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  slug: string
  initialLikes: number
}

export function LikeButton({ slug, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user has already liked this page
    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`/api/pages/${slug}/reactions`)
        if (response.ok) {
          const data = await response.json()
          // For simplicity, we'll check localStorage to see if this user liked it
          const likedPages = JSON.parse(localStorage.getItem('likedPages') || '[]')
          setIsLiked(likedPages.includes(slug))
        }
      } catch (error) {
        console.error('Error checking like status:', error)
      }
    }

    checkLikeStatus()
  }, [slug])

  const handleLike = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/pages/${slug}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reactionType: 'like' }),
      })

      if (response.ok) {
        const data = await response.json()
        setLikes(data.likes)

        // Update localStorage
        const likedPages = JSON.parse(localStorage.getItem('likedPages') || '[]')
        if (data.action === 'removed') {
          const filtered = likedPages.filter((s: string) => s !== slug)
          localStorage.setItem('likedPages', JSON.stringify(filtered))
          setIsLiked(false)
        } else {
          if (!likedPages.includes(slug)) {
            likedPages.push(slug)
            localStorage.setItem('likedPages', JSON.stringify(likedPages))
          }
          setIsLiked(true)
        }
      }
    } catch (error) {
      console.error('Error liking page:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        isLiked
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
      <span className="font-medium">{likes}</span>
    </button>
  )
}
