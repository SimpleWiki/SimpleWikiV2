'use client'

import { useState, useEffect } from 'react'
import { formatDateTime } from '@/lib/utils'
import { MessageCircle, Send, User } from 'lucide-react'

interface Comment {
  id: string
  content: string
  authorName: string | null
  createdAt: string
  author?: {
    id: number
    username: string
    displayName: string
    avatar: string | null
  }
  replies: Comment[]
}

interface CommentsProps {
  slug: string
  session: any
}

export function Comments({ slug, session }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchComments()
  }, [slug])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/pages/${slug}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault()

    const content = parentId ? replyContent : newComment
    if (!content.trim()) return

    if (!session && !authorName.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer votre nom' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/pages/${slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          parentId,
          authorName: !session ? authorName.trim() : null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })

        if (parentId) {
          setReplyContent('')
          setReplyTo(null)
        } else {
          setNewComment('')
        }

        // If comment was auto-approved, add it to the list
        if (data.comment.status === 'approved') {
          await fetchComments()
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la publication du commentaire' })
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la publication du commentaire' })
    } finally {
      setIsLoading(false)
    }
  }

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const displayName = comment.author?.displayName || comment.author?.username || comment.authorName || 'Anonyme'

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 mt-4' : 'mb-6'}`}>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center">
              {comment.author?.avatar ? (
                <img src={comment.author.avatar} alt={displayName} className="w-8 h-8 rounded-full" />
              ) : (
                <User className="w-4 h-4 text-primary-600" />
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">{displayName}</div>
              <div className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</div>
            </div>
          </div>

          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>

          {!isReply && (
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              Répondre
            </button>
          )}

          {replyTo === comment.id && (
            <form onSubmit={(e) => handleSubmitComment(e, comment.id)} className="mt-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Écrivez votre réponse..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                disabled={isLoading}
              />
              <div className="flex items-center justify-end space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(null)
                    setReplyContent('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !replyContent.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>{isLoading ? 'Envoi...' : 'Envoyer'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
        <MessageCircle className="w-6 h-6" />
        <span>Commentaires ({comments.length})</span>
      </h2>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={(e) => handleSubmitComment(e)} className="mb-8">
        {!session && (
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Votre nom"
            className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          />
        )}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={session ? "Écrivez un commentaire..." : "Écrivez un commentaire... (sera soumis à modération)"}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={4}
          disabled={isLoading}
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={isLoading || !newComment.trim() || (!session && !authorName.trim())}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span>{isLoading ? 'Envoi...' : 'Publier'}</span>
          </button>
        </div>
      </form>

      {isLoadingComments ? (
        <div className="text-center py-8 text-gray-500">Chargement des commentaires...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun commentaire pour le moment. Soyez le premier à commenter !
        </div>
      ) : (
        <div>
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  )
}
