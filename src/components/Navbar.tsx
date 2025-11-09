'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Search, User, LogOut, Settings, Shield } from 'lucide-react'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-primary-600">
              SimpleWiki
            </Link>

            <div className="hidden md:flex space-x-6">
              <Link
                href="/wiki"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Pages
              </Link>
              <Link
                href="/tags"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Tags
              </Link>
              <Link
                href="/search"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Recherche
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                {(session.user as any)?.isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}

                <Link
                  href="/account/profile"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{session.user?.name}</span>
                </Link>

                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
