import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('canManageBadges')

    const badgeId = parseInt(params.id)

    if (!badgeId || isNaN(badgeId)) {
      return NextResponse.json(
        { error: 'ID de badge invalide' },
        { status: 400 }
      )
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    // Check if badge is already assigned
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ce badge est déjà attribué à cet utilisateur' },
        { status: 400 }
      )
    }

    const userBadge = await prisma.userBadge.create({
      data: {
        userId,
        badgeId,
      },
      include: {
        badge: true,
        user: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
    })

    return NextResponse.json(userBadge)
  } catch (error: any) {
    console.error('Error assigning badge:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'attribution du badge' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('canManageBadges')

    const badgeId = parseInt(params.id)

    if (!badgeId || isNaN(badgeId)) {
      return NextResponse.json(
        { error: 'ID de badge invalide' },
        { status: 400 }
      )
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    await prisma.userBadge.delete({
      where: {
        userId_badgeId: {
          userId,
          badgeId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing badge:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors du retrait du badge' },
      { status: 500 }
    )
  }
}
