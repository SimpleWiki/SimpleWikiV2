import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    await requirePermission('canManageBadges')

    const badges = await prisma.badge.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(badges)
  } catch (error: any) {
    console.error('Error fetching badges:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des badges' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('canManageBadges')

    const { name, description, icon, color } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom du badge est requis' },
        { status: 400 }
      )
    }

    const badge = await prisma.badge.create({
      data: {
        name,
        description,
        icon,
        color,
      },
    })

    return NextResponse.json(badge)
  } catch (error: any) {
    console.error('Error creating badge:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du badge' },
      { status: 500 }
    )
  }
}
