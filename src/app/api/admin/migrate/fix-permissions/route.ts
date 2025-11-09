import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    // Update all admin users to have all permissions
    const adminResult = await prisma.user.updateMany({
      where: {
        isAdmin: true,
      },
      data: {
        canCreatePages: true,
        canEditOwnPages: true,
        canEditAnyPage: true,
        canPublishPages: true,
        canDeletePages: true,
        canManageTags: true,
        canComment: true,
        canApproveComments: true,
        canDeleteComments: true,
        canManageUsers: true,
        canManageRoles: true,
        canManageBadges: true,
        canViewStats: true,
        canManageSettings: true,
        canManageReactions: true,
        canSubmitPages: true,
        canViewSubmissions: true,
        canApproveSubmissions: true,
        canBanIps: true,
        canViewIpProfiles: true,
        canGeneratePremium: true,
        canSchedulePages: true,
        canViewTrash: true,
        canManageUploads: true,
        canViewEventLog: true,
      },
    })

    // Also update moderators with appropriate permissions
    const moderatorResult = await prisma.user.updateMany({
      where: {
        isModerator: true,
      },
      data: {
        canCreatePages: true,
        canEditOwnPages: true,
        canPublishPages: true,
        canComment: true,
        canApproveComments: true,
        canDeleteComments: true,
        canViewStats: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Permissions mises à jour avec succès',
      adminsUpdated: adminResult.count,
      moderatorsUpdated: moderatorResult.count,
    })
  } catch (error: any) {
    console.error('Error fixing permissions:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour des permissions' },
      { status: 500 }
    )
  }
}
