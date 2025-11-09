import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function PATCH(
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

    const { name, description, icon, color } = await request.json()

    const badge = await prisma.badge.update({
      where: { id: badgeId },
      data: {
        name,
        description,
        icon,
        color,
      },
    })

    return NextResponse.json(badge)
  } catch (error: any) {
    console.error('Error updating badge:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour du badge' },
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

    await prisma.badge.delete({
      where: { id: badgeId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting badge:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression du badge' },
      { status: 500 }
    )
  }
}
