const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { execSync } = require('child_process')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Initialisation de la base de données...')

  // Push database schema first
  console.log('📦 Création des tables de la base de données...')
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
    console.log('✅ Tables créées')
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error.message)
    process.exit(1)
  }

  // Create default roles
  console.log('📝 Création des rôles par défaut...')

  const everyoneRole = await prisma.role.upsert({
    where: { name: 'Everyone' },
    update: {},
    create: {
      name: 'Everyone',
      hierarchy: 0,
      canComment: true,
    },
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: {
      name: 'User',
      hierarchy: 10,
      canComment: true,
      canCreatePages: true,
      canEditOwnPages: true,
      canSubmitPages: true,
    },
  })

  const premiumRole = await prisma.role.upsert({
    where: { name: 'Premium' },
    update: {},
    create: {
      name: 'Premium',
      color: '#FFD700',
      hierarchy: 20,
      canComment: true,
      canCreatePages: true,
      canEditOwnPages: true,
      canPublishPages: true,
      canSubmitPages: true,
    },
  })

  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrator' },
    update: {},
    create: {
      name: 'Administrator',
      color: '#FF0000',
      hierarchy: 100,
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
      canSubmitPages: true,
      canViewSubmissions: true,
      canApproveSubmissions: true,
      canBanIps: true,
      canViewIpProfiles: true,
      canManageUsers: true,
      canManageRoles: true,
      canManageBadges: true,
      canViewStats: true,
      canManageSettings: true,
      canManageReactions: true,
      canGeneratePremium: true,
      canSchedulePages: true,
      canViewTrash: true,
      canManageUploads: true,
      canViewEventLog: true,
    },
  })

  console.log('✅ Rôles créés')

  // Create admin user
  console.log('👤 Création de l\'utilisateur admin...')

  const adminPasswordHash = await bcrypt.hash('admin', 10)

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      displayName: 'Administrateur',
      passwordHash: adminPasswordHash,
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
      canSubmitPages: true,
      canViewSubmissions: true,
      canApproveSubmissions: true,
      canBanIps: true,
      canViewIpProfiles: true,
      canManageUsers: true,
      canManageRoles: true,
      canManageBadges: true,
      canViewStats: true,
      canManageSettings: true,
      canManageReactions: true,
      canGeneratePremium: true,
      canSchedulePages: true,
      canViewTrash: true,
      canManageUploads: true,
      canViewEventLog: true,
    },
  })

  // Assign admin role to admin user
  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  })

  console.log('✅ Utilisateur admin créé (username: admin, password: admin)')

  // Create default settings
  console.log('⚙️  Création des paramètres par défaut...')

  await prisma.setting.upsert({
    where: { key: 'site_name' },
    update: {},
    create: {
      key: 'site_name',
      value: 'SimpleWiki V2',
    },
  })

  await prisma.setting.upsert({
    where: { key: 'site_description' },
    update: {},
    create: {
      key: 'site_description',
      value: 'Une plateforme wiki collaborative moderne',
    },
  })

  console.log('✅ Paramètres créés')

  // Create default reaction options
  console.log('😊 Création des réactions par défaut...')

  const defaultReactions = [
    { type: 'like', emoji: '👍', label: 'J\'aime' },
    { type: 'love', emoji: '❤️', label: 'J\'adore' },
    { type: 'laugh', emoji: '😄', label: 'Drôle' },
    { type: 'wow', emoji: '😮', label: 'Impressionnant' },
    { type: 'sad', emoji: '😢', label: 'Triste' },
  ]

  for (const reaction of defaultReactions) {
    await prisma.reactionOption.upsert({
      where: { type: reaction.type },
      update: {},
      create: reaction,
    })
  }

  console.log('✅ Réactions créées')

  console.log('\n✅ Initialisation terminée!')
  console.log('\n📋 Informations de connexion:')
  console.log('   Username: admin')
  console.log('   Password: admin')
  console.log('\n⚠️  Pensez à changer le mot de passe admin après la première connexion!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
