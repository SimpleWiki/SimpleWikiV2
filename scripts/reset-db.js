const fs = require('fs')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db')

console.log('🗑️  Suppression de la base de données...')

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
  console.log('✅ Base de données supprimée')
} else {
  console.log('ℹ️  Aucune base de données à supprimer')
}

// Delete journal file if exists
const journalPath = dbPath + '-journal'
if (fs.existsSync(journalPath)) {
  fs.unlinkSync(journalPath)
}

console.log('✅ Réinitialisation terminée')
