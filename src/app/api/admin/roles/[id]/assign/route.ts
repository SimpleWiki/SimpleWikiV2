import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('canManageRoles')

    const roleId = parseInt(params.id)

    if (!roleId || isNaN(roleId)) {
      return NextResponse.json(
        { error: 'ID de rôle invalide' },
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

    // Check if role is already assigned
    const existing = await prisma.userRoleAssignment.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ce rôle est déjà attribué à cet utilisateur' },
        { status: 400 }
      )
    }

    const roleAssignment = await prisma.userRoleAssignment.create({
      data: {
        userId,
        roleId,
      },
      include: {
        role: true,
        user: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
    })

    return NextResponse.json(roleAssignment)
  } catch (error: any) {
    console.error('Error assigning role:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'attribution du rôle' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('canManageRoles')

    const roleId = parseInt(params.id)

    if (!roleId || isNaN(roleId)) {
      return NextResponse.json(
        { error: 'ID de rôle invalide' },
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

    await prisma.userRoleAssignment.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing role:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors du retrait du rôle' },
      { status: 500 }
    )
  }
}
