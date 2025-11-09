import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Settings, Globe, Shield, Bell, Palette } from 'lucide-react'

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !(session.user as any)?.isAdmin) {
    redirect('/auth/login')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Paramètres du site</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Paramètres généraux
              </h2>
              <p className="text-sm text-gray-500">
                Configuration de base du site
              </p>
            </div>
          </div>
          <div className="ml-12 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du site
              </label>
              <input
                type="text"
                defaultValue="SimpleWiki"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                defaultValue="Un wiki simple et collaboratif"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sécurité</h2>
              <p className="text-sm text-gray-500">
                Paramètres de sécurité et d'accès
              </p>
            </div>
          </div>
          <div className="ml-12 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Inscription publique
                </p>
                <p className="text-sm text-gray-500">
                  Autoriser les nouvelles inscriptions
                </p>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Activé
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Modération des commentaires
                </p>
                <p className="text-sm text-gray-500">
                  Approuver les commentaires avant publication
                </p>
              </div>
              <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                Désactivé
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500">
                Configuration des notifications
              </p>
            </div>
          </div>
          <div className="ml-12 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email notifications</p>
                <p className="text-sm text-gray-500">
                  Envoyer des notifications par email
                </p>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Activé
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-pink-100 rounded-lg">
              <Palette className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Apparence</h2>
              <p className="text-sm text-gray-500">
                Personnalisation de l'interface
              </p>
            </div>
          </div>
          <div className="ml-12 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur principale
              </label>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary-600 rounded-lg border-2 border-gray-300"></div>
                <span className="text-sm text-gray-600">#0066CC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
