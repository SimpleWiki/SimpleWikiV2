import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    await requirePermission('canManageReactions')

    const reactions = await prisma.reactionOption.findMany({
      orderBy: {
        type: 'asc',
      },
    })

    return NextResponse.json(reactions)
  } catch (error: any) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des réactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission('canManageReactions')

    const { type, emoji, imageUrl, label } = await request.json()

    if (!type || !label) {
      return NextResponse.json(
        { error: 'Le type et le label sont requis' },
        { status: 400 }
      )
    }

    const reaction = await prisma.reactionOption.create({
      data: {
        type,
        emoji,
        imageUrl,
        label,
      },
    })

    return NextResponse.json(reaction)
  } catch (error: any) {
    console.error('Error creating reaction:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la réaction' },
      { status: 500 }
    )
  }
}
