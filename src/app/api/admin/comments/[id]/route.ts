import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('canApproveComments')

    const { status } = await request.json()

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.update({
      where: { id: params.id },
      data: { status },
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
    })

    return NextResponse.json(comment)
  } catch (error: any) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour du commentaire' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('canDeleteComments')

    await prisma.comment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression du commentaire' },
      { status: 500 }
    )
  }
}
