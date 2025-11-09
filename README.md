# SimpleWiki V2

Une plateforme wiki collaborative moderne construite avec Next.js, React, TailwindCSS et Prisma.

## Stack Technique

- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: SQLite avec Prisma ORM
- **Authentification**: NextAuth.js
- **Markdown**: markdown-it avec support KaTeX, emojis et task lists

## Fonctionnalités

- ✅ Système d'authentification complet (inscription, connexion)
- ✅ Gestion de pages wiki avec Markdown
- ✅ Système de tags
- ✅ Système de rôles et permissions
- ✅ Panel d'administration
- ✅ Système de commentaires et réactions
- ✅ Historique des révisions
- ✅ Recherche full-text
- ✅ Support multi-langues (français/anglais)

## Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Initialiser la base de données

```bash
npm run reset  # Supprimer toutes les données
npm run init   # Initialiser la DB avec les données par défaut
```

### 3. Démarrer le serveur

```bash
npm start      # Démarre le frontend et le backend
```

Le site sera accessible sur http://localhost:3000

## Commandes npm

- `npm run reset` - Supprimer toutes les données de la base de données
- `npm run init` - Initialiser la base de données avec les rôles et l'utilisateur admin par défaut
- `npm start` - Démarrer le frontend et le backend en même temps
- `npm run dev` - Mode développement
- `npm run build` - Build pour la production
- `npm run db:push` - Synchroniser le schéma Prisma avec la base de données
- `npm run db:studio` - Ouvrir Prisma Studio pour gérer la base de données

## Compte administrateur par défaut

Après l'initialisation de la base de données, vous pouvez vous connecter avec :

- **Username**: `admin`
- **Password**: `admin`

⚠️ **Important** : Changez le mot de passe admin après la première connexion !

## Structure du projet

```
/
├── prisma/              # Schéma Prisma et base de données
├── public/              # Fichiers statiques
├── scripts/             # Scripts utilitaires
│   ├── reset-db.js      # Script pour réinitialiser la DB
│   └── init-db.js       # Script pour initialiser la DB
├── src/
│   ├── app/             # Pages et routes Next.js (App Router)
│   │   ├── api/         # API Routes
│   │   ├── auth/        # Pages d'authentification
│   │   ├── wiki/        # Pages wiki
│   │   └── admin/       # Pages d'administration
│   ├── components/      # Composants React réutilisables
│   ├── lib/             # Utilitaires et configuration
│   │   ├── prisma.ts    # Client Prisma
│   │   ├── auth.ts      # Configuration NextAuth
│   │   ├── markdown.ts  # Rendu Markdown
│   │   └── utils.ts     # Fonctions utilitaires
│   └── types/           # Types TypeScript
└── package.json
```

## Système de permissions

Le projet inclut un système de permissions granulaire avec 4 rôles par défaut :

- **Everyone** : Permissions de base pour tous
- **User** : Utilisateur enregistré avec permissions de création
- **Premium** : Utilisateur premium avec permissions étendues
- **Administrator** : Accès complet à toutes les fonctionnalités

## Développement

Le projet utilise TypeScript pour une meilleure sécurité de type. Toutes les routes API sont typées et validées.

### Ajouter une nouvelle page

1. Créer un dossier dans `src/app/`
2. Créer un fichier `page.tsx`
3. Exporter un composant React par défaut

### Ajouter une API route

1. Créer un dossier dans `src/app/api/`
2. Créer un fichier `route.ts`
3. Exporter les fonctions GET, POST, etc.

## Base de données

Le projet utilise SQLite avec Prisma. Pour visualiser et modifier la base de données :

```bash
npm run db:studio
```

## Production

Pour déployer en production :

1. Construire le projet :
   ```bash
   npm run build
   ```

2. Configurer les variables d'environnement :
   - `NEXTAUTH_SECRET` : Secret pour NextAuth
   - `NEXTAUTH_URL` : URL de production

3. Démarrer le serveur :
   ```bash
   npm start
   ```

## Licence

MIT
