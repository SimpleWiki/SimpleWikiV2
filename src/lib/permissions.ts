import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export type Permission =
  | 'canCreatePages'
  | 'canEditOwnPages'
  | 'canEditAnyPage'
  | 'canPublishPages'
  | 'canDeletePages'
  | 'canManageTags'
  | 'canComment'
  | 'canApproveComments'
  | 'canDeleteComments'
  | 'canManageUsers'
  | 'canManageRoles'
  | 'canManageBadges'
  | 'canViewStats'
  | 'canManageSettings'
  | 'canManageReactions'

/**
 * Check if the current user has a specific permission
 * Admins automatically have all permissions
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return false
  }

  const user = session.user as any

  // Admins have all permissions
  if (user.isAdmin) {
    return true
  }

  // Check specific permission
  return user[permission] === true
}

/**
 * Require a specific permission or throw an error
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const hasAccess = await hasPermission(permission)

  if (!hasAccess) {
    throw new Error(`Permission denied: ${permission}`)
  }
}

/**
 * Get the current session user
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user as any
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.isAdmin === true
}

/**
 * Require admin access or throw an error
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin()

  if (!admin) {
    throw new Error('Admin access required')
  }
}
