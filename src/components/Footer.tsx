export function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">SimpleWiki V2</h3>
            <p className="text-gray-600">
              Une plateforme wiki collaborative moderne et performante.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <a href="/wiki" className="text-gray-600 hover:text-primary-600">
                  Toutes les pages
                </a>
              </li>
              <li>
                <a href="/tags" className="text-gray-600 hover:text-primary-600">
                  Tags
                </a>
              </li>
              <li>
                <a href="/search" className="text-gray-600 hover:text-primary-600">
                  Recherche
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">À propos</h3>
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} SimpleWiki. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
