import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          include: {
            roleAssignments: {
              include: {
                role: true,
              },
            },
          },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isValid) {
          return null
        }

        if (user.isBanned) {
          throw new Error('Votre compte a été banni.')
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        // Admins have all permissions automatically
        const allPermissions = user.isAdmin ? true : false

        return {
          id: user.id.toString(),
          name: user.displayName || user.username,
          email: user.email,
          image: user.avatar,
          username: user.username,
          isAdmin: user.isAdmin,
          isModerator: user.isModerator,
          isPremium: user.isPremium,
          // Permissions (admins get all permissions automatically)
          canCreatePages: allPermissions || user.canCreatePages,
          canEditOwnPages: allPermissions || user.canEditOwnPages,
          canEditAnyPage: allPermissions || user.canEditAnyPage,
          canPublishPages: allPermissions || user.canPublishPages,
          canDeletePages: allPermissions || user.canDeletePages,
          canManageTags: allPermissions || user.canManageTags,
          canComment: allPermissions || user.canComment,
          canApproveComments: allPermissions || user.canApproveComments,
          canDeleteComments: allPermissions || user.canDeleteComments,
          canManageUsers: allPermissions || user.canManageUsers,
          canManageRoles: allPermissions || user.canManageRoles,
          canManageBadges: allPermissions || user.canManageBadges,
          canViewStats: allPermissions || user.canViewStats,
          canManageSettings: allPermissions || user.canManageSettings,
          canManageReactions: allPermissions || user.canManageReactions,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const jwtUserIsAdmin = (user as any).isAdmin

        token.id = user.id
        token.username = (user as any).username
        token.isAdmin = jwtUserIsAdmin
        token.isModerator = (user as any).isModerator
        token.isPremium = (user as any).isPremium
        // Permissions (admins get all permissions)
        token.canCreatePages = jwtUserIsAdmin || (user as any).canCreatePages
        token.canEditOwnPages = jwtUserIsAdmin || (user as any).canEditOwnPages
        token.canEditAnyPage = jwtUserIsAdmin || (user as any).canEditAnyPage
        token.canPublishPages = jwtUserIsAdmin || (user as any).canPublishPages
        token.canDeletePages = jwtUserIsAdmin || (user as any).canDeletePages
        token.canManageTags = jwtUserIsAdmin || (user as any).canManageTags
        token.canComment = jwtUserIsAdmin || (user as any).canComment
        token.canApproveComments = jwtUserIsAdmin || (user as any).canApproveComments
        token.canDeleteComments = jwtUserIsAdmin || (user as any).canDeleteComments
        token.canManageUsers = jwtUserIsAdmin || (user as any).canManageUsers
        token.canManageRoles = jwtUserIsAdmin || (user as any).canManageRoles
        token.canManageBadges = jwtUserIsAdmin || (user as any).canManageBadges
        token.canViewStats = jwtUserIsAdmin || (user as any).canViewStats
        token.canManageSettings = jwtUserIsAdmin || (user as any).canManageSettings
        token.canManageReactions = jwtUserIsAdmin || (user as any).canManageReactions
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const adminStatus = token.isAdmin as boolean
        const user = session.user as any

        user.id = token.id as string
        user.username = token.username as string
        user.isAdmin = adminStatus
        user.isModerator = token.isModerator as boolean
        user.isPremium = token.isPremium as boolean
        // Permissions (admins get all permissions)
        user.canCreatePages = adminStatus || (token.canCreatePages as boolean)
        user.canEditOwnPages = adminStatus || (token.canEditOwnPages as boolean)
        user.canEditAnyPage = adminStatus || (token.canEditAnyPage as boolean)
        user.canPublishPages = adminStatus || (token.canPublishPages as boolean)
        user.canDeletePages = adminStatus || (token.canDeletePages as boolean)
        user.canManageTags = adminStatus || (token.canManageTags as boolean)
        user.canComment = adminStatus || (token.canComment as boolean)
        user.canApproveComments = adminStatus || (token.canApproveComments as boolean)
        user.canDeleteComments = adminStatus || (token.canDeleteComments as boolean)
        user.canManageUsers = adminStatus || (token.canManageUsers as boolean)
        user.canManageRoles = adminStatus || (token.canManageRoles as boolean)
        user.canManageBadges = adminStatus || (token.canManageBadges as boolean)
        user.canViewStats = adminStatus || (token.canViewStats as boolean)
        user.canManageSettings = adminStatus || (token.canManageSettings as boolean)
        user.canManageReactions = adminStatus || (token.canManageReactions as boolean)
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production',
}
