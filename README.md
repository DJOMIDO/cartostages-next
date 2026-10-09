# CartoStages NLP

**En ligne : https://cartostages-next.vercel.app**

Carte interactive des offres de stage, CDI/CDD et post-doc en traitement
automatique des langues (TAL/NLP) en France, collectées automatiquement
depuis la page d'offres du laboratoire [ERSS (Toulouse)](http://w3.erss.univ-tlse2.fr/membre/tanguy/offres.html).

Réécriture moderne de [CartoStages IDéaL](https://github.com/DJOMIDO/cartostagesideal)
(Projet Master IdL, Université Grenoble Alpes).

## Stack

| Couche | Technologie |
|---|---|
| Framework | Next.js (App Router, RSC, Turbopack) |
| Langage | TypeScript strict |
| Base de données | PostgreSQL (serverless, via [Neon](https://neon.tech)) |
| ORM / migrations | Drizzle ORM + drizzle-kit |
| Authentification | Better Auth (email + mot de passe, plugin admin/rôles) |
| UI | Tailwind CSS v4 + shadcn/ui, Leaflet (react-leaflet) |
| Collecte | Scraper TypeScript (cheerio), déclenché par Vercel Cron ou manuellement |
| Hébergement | Vercel (déploiement + cron quotidien) |

## Démarrage

```bash
npm install
cp .env.example .env        # renseigner DATABASE_URL (Neon) et BETTER_AUTH_SECRET
npx drizzle-kit push        # créer les tables
npm run create-admin admin@example.com "motdepasse"  # premier compte admin
npm run sync                # premier import des offres WAGA
npm run dev                 # http://localhost:3000
```

## Scripts

- `npm run dev` / `build` / `start` / `lint`
- `npm run sync` — aspire les offres depuis la page WAGA (upsert idempotent)
- `npm run create-admin <email> <mdp> [nom]` — crée un compte administrateur
- `npx drizzle-kit push` — applique le schéma ; `npx drizzle-kit generate` — migration SQL

## Synchronisation des données

- **Cron** : `vercel.json` planifie `GET /api/cron/sync` chaque jour à 07:00 UTC
  (protégé par `CRON_SECRET`).
- **Manuel** : bouton « Synchroniser WAGA » dans `/admin` (session admin requise).
- Déduplication par `sourceId` (identifiant de l'offre sur la page source) ;
  une offre réaparaissant après archivage est réactivée automatiquement.

## Architecture

```
src/
  app/
    page.tsx            Accueil (stats + dernières offres)
    carte/              Carte Leaflet (marqueurs par type de contrat)
    recherche/          Recherche plein-texte (ILIKE) + filtres
    login/              Connexion admin
    admin/              Back-office : liste, archivage, sync
    api/
      auth/[...all]     Better Auth
      cron/sync         Endpoint cron (Bearer CRON_SECRET)
      admin/sync        Sync déclenchée par session admin
      admin/offers/[id]/archive   Toggle archived
  lib/
    db/                 Schéma Drizzle (offers + tables Better Auth)
    crawler/            Parseur WAGA (cheerio) + géocodage statique des villes
    queries.ts          Lectures typées côté serveur
    auth.ts / auth-client.ts / auth-utils.ts
scripts/
  sync.ts               CLI de synchronisation
  create-admin.ts       Création de compte admin
  geocode-cities.mts    Régénère la table de coordonnées des villes
```

## Notes

- Le fichier `src/lib/crawler/city-coords.ts` est une table statique ville →
  coordonnées générée par `scripts/geocode-cities.mts` (Nominatim). Relancer ce
  script quand de nouvelles villes apparaissent dans les offres.
- Les détails d'une offre pointent vers le fichier texte hébergé par l'ERSS
  (lien direct, pas de stockage de contenu).

## Licence

MIT
