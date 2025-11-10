const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const adminPermissionData = {
  isAdmin: true,
  isModerator: true,
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
}

const moderatorPermissionData = {
  isModerator: true,
  canCreatePages: true,
  canEditOwnPages: true,
  canPublishPages: true,
  canComment: true,
  canApproveComments: true,
  canDeleteComments: true,
  canViewStats: true,
}

async function collectIdsFromRoles(field) {
  const roles = await prisma.role.findMany({
    where: {
      [field]: true,
    },
    select: {
      id: true,
    },
  })

  if (roles.length === 0) {
    return []
  }

  const assignments = await prisma.userRoleAssignment.findMany({
    where: {
      roleId: {
        in: roles.map((role) => role.id),
      },
    },
    select: {
      userId: true,
    },
  })

  return assignments.map((assignment) => assignment.userId)
}

async function fixAdminPermissions() {
  console.log('Mise à jour des permissions pour les administrateurs...')

  const adminIdsFromRoles = await collectIdsFromRoles('isAdmin')
  const adminFlaggedUsers = await prisma.user.findMany({
    where: {
      isAdmin: true,
    },
    select: {
      id: true,
    },
  })
  const uniqueAdminIds = Array.from(
    new Set([
      ...adminIdsFromRoles,
      ...adminFlaggedUsers.map((user) => user.id),
    ])
  )

  const adminResult =
    uniqueAdminIds.length === 0
      ? { count: 0 }
      : await prisma.user.updateMany({
          where: {
            id: {
              in: uniqueAdminIds,
            },
          },
          data: adminPermissionData,
        })

  console.log(
    `✓ ${adminResult.count} administrateur(s) mis à jour avec toutes les permissions`
  )

  console.log('Mise à jour des permissions pour les modérateurs...')

  const moderatorIdsFromRoles = await collectIdsFromRoles('isModerator')
  const moderatorFlaggedUsers = await prisma.user.findMany({
    where: {
      isModerator: true,
    },
    select: {
      id: true,
    },
  })
  const uniqueModeratorIds = Array.from(
    new Set([
      ...moderatorIdsFromRoles,
      ...moderatorFlaggedUsers.map((user) => user.id),
    ])
  ).filter((id) => !uniqueAdminIds.includes(id))

  const moderatorResult =
    uniqueModeratorIds.length === 0
      ? { count: 0 }
      : await prisma.user.updateMany({
          where: {
            id: {
              in: uniqueModeratorIds,
            },
          },
          data: moderatorPermissionData,
        })

  console.log(
    `✓ ${moderatorResult.count} modérateur(s) mis à jour avec les permissions appropriées`
  )

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
