import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function PATCH(
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

    const body = await request.json()
    const { name, color, hierarchy, ...permissions } = body

    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        name,
        color,
        hierarchy,
        ...permissions,
      },
    })

    return NextResponse.json(role)
  } catch (error: any) {
    console.error('Error updating role:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour du rôle' },
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

    await prisma.role.delete({
      where: { id: roleId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting role:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression du rôle' },
      { status: 500 }
    )
  }
}
