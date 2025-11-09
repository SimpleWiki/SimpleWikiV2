import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixAdminPermissions() {
  console.log('Mise à jour des permissions pour les administrateurs...')

  // Update all admin users to have all permissions
  const result = await prisma.user.updateMany({
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

  console.log(`✓ ${result.count} administrateur(s) mis à jour avec toutes les permissions`)

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

  console.log(`✓ ${moderatorResult.count} modérateur(s) mis à jour avec les permissions appropriées`)

  await prisma.$disconnect()
}

fixAdminPermissions()
  .then(() => {
    console.log('✓ Terminé !')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Erreur:', error)
    process.exit(1)
  })
