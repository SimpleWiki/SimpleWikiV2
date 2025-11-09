import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    await requirePermission('canManageSettings')

    const settings = await prisma.setting.findMany()

    // Convert to key-value object
    const settingsObj: Record<string, string> = {}
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value
    })

    return NextResponse.json(settingsObj)
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requirePermission('canManageSettings')

    const body = await request.json()

    // Update each setting
    const promises = Object.entries(body).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    })

    await Promise.all(promises)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    )
  }
}
