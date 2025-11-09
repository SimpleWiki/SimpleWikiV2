import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

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

// GET - Get reactions for a page
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: params.slug },
      select: { id: true }
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const reactions = await prisma.pageReaction.findMany({
      where: { pageId: page.id }
    })

    // Group reactions by type
    const reactionCounts = reactions.reduce((acc: Record<string, number>, reaction) => {
      acc[reaction.reactionType] = (acc[reaction.reactionType] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      total: reactions.length,
      reactions: reactionCounts
    })
  } catch (error) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 })
  }
}

// POST - Add a reaction
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const { reactionType } = await request.json()

    if (!reactionType) {
      return NextResponse.json({ error: 'Reaction type is required' }, { status: 400 })
    }

    const page = await prisma.page.findUnique({
      where: { slug: params.slug },
      select: { id: true, likes: true }
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const userId = session?.user ? parseInt((session.user as any).id) : null
    const ipHash = !userId ? getIpHash(request) : null

    // Check if user/IP already reacted
    const existingReaction = await prisma.pageReaction.findFirst({
      where: {
        pageId: page.id,
        ...(userId ? { userId } : { ipHash })
      }
    })

    if (existingReaction) {
      // If same reaction type, remove it (toggle)
      if (existingReaction.reactionType === reactionType) {
        await prisma.$transaction(async (tx) => {
          await tx.pageReaction.delete({
            where: { id: existingReaction.id }
          })

          // Decrement likes count if it's a like
          if (reactionType === 'like') {
            await tx.page.update({
              where: { id: page.id },
              data: { likes: Math.max(0, (page.likes || 0) - 1) }
            })
          }
        })

        return NextResponse.json({
          success: true,
          action: 'removed',
          likes: reactionType === 'like' ? Math.max(0, (page.likes || 0) - 1) : page.likes
        })
      } else {
        // Update to new reaction type
        await prisma.$transaction(async (tx) => {
          await tx.pageReaction.update({
            where: { id: existingReaction.id },
            data: { reactionType }
          })

          // Update likes count based on reaction type change
          if (existingReaction.reactionType === 'like' && reactionType !== 'like') {
            await tx.page.update({
              where: { id: page.id },
              data: { likes: Math.max(0, (page.likes || 0) - 1) }
            })
          } else if (existingReaction.reactionType !== 'like' && reactionType === 'like') {
            await tx.page.update({
              where: { id: page.id },
              data: { likes: (page.likes || 0) + 1 }
            })
          }
        })

        const newLikes = reactionType === 'like'
          ? (page.likes || 0) + 1
          : existingReaction.reactionType === 'like'
            ? Math.max(0, (page.likes || 0) - 1)
            : page.likes

        return NextResponse.json({
          success: true,
          action: 'updated',
          likes: newLikes
        })
      }
    }

    // Create new reaction
    await prisma.$transaction(async (tx) => {
      await tx.pageReaction.create({
        data: {
          pageId: page.id,
          userId,
          ipHash,
          reactionType
        }
      })

      // Increment likes count if it's a like
      if (reactionType === 'like') {
        await tx.page.update({
          where: { id: page.id },
          data: { likes: (page.likes || 0) + 1 }
        })
      }
    })

    return NextResponse.json({
      success: true,
      action: 'added',
      likes: reactionType === 'like' ? (page.likes || 0) + 1 : page.likes
    })
  } catch (error) {
    console.error('Error adding reaction:', error)
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 })
  }
}

// DELETE - Remove a reaction
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const reactionType = searchParams.get('reactionType')

    const page = await prisma.page.findUnique({
      where: { slug: params.slug },
      select: { id: true, likes: true }
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const userId = session?.user ? parseInt((session.user as any).id) : null
    const ipHash = !userId ? getIpHash(request) : null

    const reaction = await prisma.pageReaction.findFirst({
      where: {
        pageId: page.id,
        ...(userId ? { userId } : { ipHash }),
        ...(reactionType ? { reactionType } : {})
      }
    })

    if (!reaction) {
      return NextResponse.json({ error: 'Reaction not found' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.pageReaction.delete({
        where: { id: reaction.id }
      })

      // Decrement likes count if it's a like
      if (reaction.reactionType === 'like') {
        await tx.page.update({
          where: { id: page.id },
          data: { likes: Math.max(0, (page.likes || 0) - 1) }
        })
      }
    })

    return NextResponse.json({
      success: true,
      likes: reaction.reactionType === 'like' ? Math.max(0, (page.likes || 0) - 1) : page.likes
    })
  } catch (error) {
    console.error('Error removing reaction:', error)
    return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 })
  }
}
