import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission, getCurrentUser } from '@/lib/permissions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('canManageUsers')

    const userId = parseInt(params.id)
    const currentUser = await getCurrentUser()

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID utilisateur invalide' },
        { status: 400 }
      )
    }

    // Prevent users from modifying themselves
    if (currentUser.id === userId.toString()) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre compte' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Prepare update data
    const updateData: any = {}

    // Handle ban/unban
    if (body.isBanned !== undefined) {
      updateData.isBanned = body.isBanned
      if (body.isBanned) {
        updateData.bannedAt = new Date()
        updateData.banReason = body.banReason || 'Non spécifié'
      } else {
        updateData.bannedAt = null
        updateData.banReason = null
      }
    }

    // Handle role changes
    if (body.isAdmin !== undefined) {
      updateData.isAdmin = body.isAdmin
    }
    if (body.isModerator !== undefined) {
      updateData.isModerator = body.isModerator
    }

    // Handle permissions
    const permissionFields = [
      'canCreatePages',
      'canEditOwnPages',
      'canEditAnyPage',
      'canPublishPages',
      'canDeletePages',
      'canManageTags',
      'canComment',
      'canApproveComments',
      'canDeleteComments',
      'canManageUsers',
      'canManageRoles',
      'canManageBadges',
      'canViewStats',
      'canManageSettings',
      'canManageReactions',
    ]

    permissionFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        displayName: true,
        isAdmin: true,
        isModerator: true,
        isBanned: true,
        banReason: true,
        bannedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('canManageUsers')

    const userId = parseInt(params.id)
    const currentUser = await getCurrentUser()

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID utilisateur invalide' },
        { status: 400 }
      )
    }

    // Prevent users from deleting themselves
    if (currentUser.id === userId.toString()) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 403 }
      )
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
}
