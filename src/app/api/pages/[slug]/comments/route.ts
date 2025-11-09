import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { nanoid } from 'nanoid'

interface Params {
  params: {
    slug: string
  }
}

// Get IP hash for anonymous users
function getIpHash(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return crypto.createHash('sha256').update(ip).digest('hex')
}

// GET - Get comments for a page
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: params.slug },
      select: { id: true }
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const comments = await prisma.comment.findMany({
      where: {
        pageId: page.id,
        status: 'approved',
        parentId: null  // Only get top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            },
            reactions: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        reactions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST - Create a new comment
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const { content, parentId, authorName } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Comment is too long (max 5000 characters)' }, { status: 400 })
    }

    const page = await prisma.page.findUnique({
      where: { slug: params.slug },
      select: { id: true }
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const userId = session?.user ? parseInt((session.user as any).id) : null
    const ipHash = !userId ? getIpHash(request) : null

    // Validate parent comment if provided
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      })

      if (!parentComment || parentComment.pageId !== page.id) {
        return NextResponse.json({ error: 'Invalid parent comment' }, { status: 400 })
      }
    }

    // Auto-approve comments from logged-in users, require approval for anonymous
    const status = userId ? 'approved' : 'pending'

    const comment = await prisma.comment.create({
      data: {
        id: nanoid(),
        pageId: page.id,
        authorId: userId,
        authorName: userId ? null : (authorName || 'Anonyme'),
        authorIpHash: ipHash,
        content: content.trim(),
        parentId: parentId || null,
        status
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      comment,
      message: status === 'pending' ? 'Your comment is awaiting approval' : 'Comment posted successfully'
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
