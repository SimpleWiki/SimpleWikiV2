import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/permissions'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(currentUser.id) },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        avatar: true,
        bio: true,
        totpEnabled: true,
      },
    })

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération du profil' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { displayName, email, bio, avatar, currentPassword, newPassword } = body

    const updateData: any = {}

    // Update basic profile fields
    if (displayName !== undefined) {
      updateData.displayName = displayName
    }
    if (email !== undefined) {
      updateData.email = email
    }
    if (bio !== undefined) {
      updateData.bio = bio
    }
    if (avatar !== undefined) {
      updateData.avatar = avatar
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Le mot de passe actuel est requis' },
          { status: 400 }
        )
      }

      // Verify current password
      const user = await prisma.user.findUnique({
        where: { id: parseInt(currentUser.id) },
        select: { passwordHash: true },
      })

      if (!user?.passwordHash) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        )
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash)

      if (!isValid) {
        return NextResponse.json(
          { error: 'Mot de passe actuel incorrect' },
          { status: 400 }
        )
      }

      // Hash new password
      updateData.passwordHash = await bcrypt.hash(newPassword, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(currentUser.id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        avatar: true,
        bio: true,
        totpEnabled: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    )
  }
}
