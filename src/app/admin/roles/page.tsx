import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Shield, Users } from 'lucide-react'

export default async function AdminRolesPage() {
  const session = await getServerSession(authOptions)

  if (!session || !(session.user as any)?.isAdmin) {
    redirect('/auth/login')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Gestion des rôles</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Administrateur
                </h2>
                <p className="text-sm text-gray-500">
                  Accès complet à toutes les fonctionnalités
                </p>
              </div>
            </div>
            <div className="ml-12">
              <h3 className="font-medium text-gray-900 mb-2">Permissions:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Gérer tous les utilisateurs</li>
                <li>Gérer toutes les pages</li>
                <li>Modérer les commentaires</li>
                <li>Gérer les rôles et permissions</li>
                <li>Configurer les paramètres du site</li>
                <li>Gérer les badges et réactions</li>
              </ul>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Utilisateur</h2>
                <p className="text-sm text-gray-500">
                  Permissions standard pour tous les utilisateurs
                </p>
              </div>
            </div>
            <div className="ml-12">
              <h3 className="font-medium text-gray-900 mb-2">Permissions:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Créer et modifier ses propres pages</li>
                <li>Commenter sur toutes les pages</li>
                <li>Aimer les pages et commentaires</li>
                <li>Gérer son profil</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
