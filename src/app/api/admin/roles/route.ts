import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    await requirePermission('canManageRoles')

    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            userAssignments: true,
          },
        },
      },
      orderBy: {
        hierarchy: 'desc',
      },
    })

    return NextResponse.json(roles)
  } catch (error: any) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des rôles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('canManageRoles')

    const body = await request.json()
    const { name, color, hierarchy, ...permissions } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom du rôle est requis' },
        { status: 400 }
      )
    }

    const role = await prisma.role.create({
      data: {
        name,
        color,
        hierarchy: hierarchy || 0,
        ...permissions,
      },
    })

    return NextResponse.json(role)
  } catch (error: any) {
    console.error('Error creating role:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du rôle' },
      { status: 500 }
    )
  }
}
