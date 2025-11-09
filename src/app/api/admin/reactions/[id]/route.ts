import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('canManageReactions')

    const reactionId = parseInt(params.id)

    if (!reactionId || isNaN(reactionId)) {
      return NextResponse.json(
        { error: 'ID de réaction invalide' },
        { status: 400 }
      )
    }

    const { type, emoji, imageUrl, label } = await request.json()

    const reaction = await prisma.reactionOption.update({
      where: { id: reactionId },
      data: {
        type,
        emoji,
        imageUrl,
        label,
      },
    })

    return NextResponse.json(reaction)
  } catch (error: any) {
    console.error('Error updating reaction:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour de la réaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('canManageReactions')

    const reactionId = parseInt(params.id)

    if (!reactionId || isNaN(reactionId)) {
      return NextResponse.json(
        { error: 'ID de réaction invalide' },
        { status: 400 }
      )
    }

    await prisma.reactionOption.delete({
      where: { id: reactionId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting reaction:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression de la réaction' },
      { status: 500 }
    )
  }
}
