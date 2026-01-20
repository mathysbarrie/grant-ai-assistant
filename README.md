# Grant AI Assistant

Assistant IA pour l'analyse rapide d'appels à projets (subventions) destiné aux collectivités territoriales.

## Description

Grant AI Assistant transforme 30-60 minutes de lecture d'un PDF d'appel à projets en une **fiche décisionnelle de 3 minutes** structurée en 6 sections :

1. **Résumé exécutif** (10 lignes max)
2. **Éligibilité** (OUI / NON / INCERTAIN avec justification)
3. **Termes financiers** (montants, taux, contraintes)
4. **Délais & Charge de travail** (deadline, complexité estimée)
5. **Points bloquants & Risques**
6. **Recommandation finale** (✅ À creuser / ⚠️ À vérifier / ❌ À ignorer)

L'application utilise l'IA (Llama 3.1 via Groq API gratuite) pour analyser les documents et forcer une décision claire.

## Fonctionnalités

- ✅ Upload de PDF par drag & drop ou sélection de fichier
- 🤖 Analyse IA avec Groq (Llama 3.1 - gratuit)
- 📊 Fiche décisionnelle standardisée avec badges visuels
- 💾 Historique des analyses (stocké dans Vercel KV)
- 📝 Notes personnelles par analyse
- 📄 Export PDF
- 📋 Copie dans le presse-papiers
- 🎨 Interface responsive et professionnelle

## Stack technique

- **Framework** : Next.js 14+ (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **IA** : Groq API (Llama 3.1-70b-versatile - gratuit)
- **Stockage** : Vercel KV (Redis)
- **Parsing PDF** : pdf-parse
- **Déploiement** : Vercel

## Prérequis

- Node.js 18 ou supérieur
- npm ou yarn
- Compte Groq (gratuit)
- Compte Vercel (gratuit)

## Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd maman_project
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Groq API (obligatoire)
GROQ_API_KEY=votre_clé_groq_ici

# Vercel KV (obligatoire pour le stockage)
KV_URL=votre_kv_url
KV_REST_API_URL=votre_kv_rest_api_url
KV_REST_API_TOKEN=votre_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=votre_kv_rest_api_read_only_token
```

#### Comment obtenir les clés :

**Groq API** (gratuit) :
1. Allez sur [https://console.groq.com](https://console.groq.com)
2. Créez un compte gratuit
3. Générez une clé API dans la section "API Keys"
4. Copiez la clé et ajoutez-la à `.env.local`

**Vercel KV** (gratuit jusqu'à 256 MB) :
1. Créez un compte sur [https://vercel.com](https://vercel.com)
2. Allez dans "Storage" > "Create Database" > "KV"
3. Nommez votre base (ex: "grant-ai-storage")
4. Cliquez sur l'onglet ".env.local"
5. Copiez toutes les variables KV_* dans votre fichier `.env.local`

### 4. Lancer en développement

```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## Déploiement sur Vercel

### Méthode 1 : Via le dashboard Vercel (recommandé)

1. Connectez-vous sur [https://vercel.com](https://vercel.com)
2. Cliquez sur "Add New" > "Project"
3. Importez votre repository Git
4. Configurez les variables d'environnement :
   - `GROQ_API_KEY` : votre clé Groq
   - Les variables KV seront automatiquement ajoutées si vous avez créé la base KV dans le même projet
5. Déployez !

### Méthode 2 : Via CLI

```bash
npm install -g vercel
vercel login
vercel
```

Suivez les instructions et ajoutez les variables d'environnement quand demandé.

## Utilisation

1. **Uploader un PDF** : Glissez-déposez ou sélectionnez un PDF d'appel à projets (max 10MB)
2. **Attendez l'analyse** : L'IA traite le document (10-30 secondes)
3. **Consultez la fiche décisionnelle** : Lisez les 6 sections structurées
4. **Décidez** : Basez-vous sur la recommandation finale (✅ ⚠️ ❌)
5. **Ajoutez des notes** : Personnalisez avec vos propres remarques
6. **Exportez** : PDF ou copie texte pour partage

## Limitations connues

### MVP (version actuelle)
- ❌ Pas d'authentification (accès ouvert)
- ❌ Pas de scraping d'URL (upload PDF uniquement)
- ❌ Limite Groq gratuit : 30 requêtes/minute
- ❌ Taille max PDF : 10MB
- ❌ Pas de comparaison entre appels à projets
- ❌ Pas d'alertes deadline

### Limites techniques
- L'IA peut occasionnellement donner des réponses incomplètes (réessayez dans ce cas)
- Le parsing PDF peut échouer sur des PDF scannés (images) ou très complexes
- Les PDF protégés par mot de passe ne sont pas supportés

## Structure du projet

```
maman_project/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts      # Upload et analyse de PDF
│   │   └── history/
│   │       ├── route.ts           # Liste et suppression
│   │       └── [id]/route.ts      # Récupération et mise à jour
│   ├── globals.css                # Styles globaux
│   ├── layout.tsx                 # Layout principal
│   └── page.tsx                   # Page principale (upload + affichage)
├── components/
│   ├── DecisionSheet.tsx          # Affichage de la fiche décisionnelle
│   └── HistorySidebar.tsx         # Barre latérale d'historique
├── lib/
│   ├── ai-service.ts              # Service d'analyse IA (Groq)
│   ├── export.ts                  # Export PDF et copie presse-papiers
│   ├── pdf-processor.ts           # Extraction de texte PDF
│   ├── storage.ts                 # Service de stockage KV
│   └── types.ts                   # Types TypeScript
└── _plans/                        # Documentation du projet (AlignFirst)
```

## Développement futur (Phase 2)

Fonctionnalités prévues :
- 🔐 Authentification multi-utilisateurs
- 🔗 Scraping automatique depuis URL
- ⚖️ Comparaison de plusieurs appels à projets
- 🔔 Alertes deadline
- 📊 Statistiques et tableaux de bord
- 🎨 Templates personnalisables par type de subvention

## Support

Pour toute question ou problème :
- Vérifiez que les variables d'environnement sont correctement configurées
- Consultez les logs Vercel en cas d'erreur de déploiement
- Vérifiez que votre clé Groq est valide et non expirée

## Licence

Ce projet est développé pour un usage interne. Tous droits réservés.
