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
        const isAdmin = (user as any).isAdmin

        token.id = user.id
        token.username = (user as any).username
        token.isAdmin = isAdmin
        token.isModerator = (user as any).isModerator
        token.isPremium = (user as any).isPremium
        // Permissions (admins get all permissions)
        token.canCreatePages = isAdmin || (user as any).canCreatePages
        token.canEditOwnPages = isAdmin || (user as any).canEditOwnPages
        token.canEditAnyPage = isAdmin || (user as any).canEditAnyPage
        token.canPublishPages = isAdmin || (user as any).canPublishPages
        token.canDeletePages = isAdmin || (user as any).canDeletePages
        token.canManageTags = isAdmin || (user as any).canManageTags
        token.canComment = isAdmin || (user as any).canComment
        token.canApproveComments = isAdmin || (user as any).canApproveComments
        token.canDeleteComments = isAdmin || (user as any).canDeleteComments
        token.canManageUsers = isAdmin || (user as any).canManageUsers
        token.canManageRoles = isAdmin || (user as any).canManageRoles
        token.canManageBadges = isAdmin || (user as any).canManageBadges
        token.canViewStats = isAdmin || (user as any).canViewStats
        token.canManageSettings = isAdmin || (user as any).canManageSettings
        token.canManageReactions = isAdmin || (user as any).canManageReactions
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const isAdmin = token.isAdmin as boolean

        (session.user as any).id = token.id as string
        (session.user as any).username = token.username as string
        (session.user as any).isAdmin = isAdmin
        (session.user as any).isModerator = token.isModerator as boolean;
        (session.user as any).isPremium = token.isPremium as boolean;
        // Permissions (admins get all permissions)
        (session.user as any).canCreatePages = isAdmin || (token.canCreatePages as boolean);
        (session.user as any).canEditOwnPages = isAdmin || (token.canEditOwnPages as boolean);
        (session.user as any).canEditAnyPage = isAdmin || (token.canEditAnyPage as boolean);
        (session.user as any).canPublishPages = isAdmin || (token.canPublishPages as boolean);
        (session.user as any).canDeletePages = isAdmin || (token.canDeletePages as boolean);
        (session.user as any).canManageTags = isAdmin || (token.canManageTags as boolean);
        (session.user as any).canComment = isAdmin || (token.canComment as boolean);
        (session.user as any).canApproveComments = isAdmin || (token.canApproveComments as boolean);
        (session.user as any).canDeleteComments = isAdmin || (token.canDeleteComments as boolean);
        (session.user as any).canManageUsers = isAdmin || (token.canManageUsers as boolean);
        (session.user as any).canManageRoles = isAdmin || (token.canManageRoles as boolean);
        (session.user as any).canManageBadges = isAdmin || (token.canManageBadges as boolean);
        (session.user as any).canViewStats = isAdmin || (token.canViewStats as boolean);
        (session.user as any).canManageSettings = isAdmin || (token.canManageSettings as boolean);
        (session.user as any).canManageReactions = isAdmin || (token.canManageReactions as boolean);
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
