# Commandes Composants — YAZAKI

Application de gestion des commandes de composants par ligne de production.  
Stack : **ASP.NET Core 10** (API) + **React 18 / Vite** (frontend) + **PostgreSQL 18**.

---

## Prérequis

| Outil | Version | Lien |
|---|---|---|
| .NET SDK | 10.x | https://dotnet.microsoft.com/download |
| Node.js | 18+ | https://nodejs.org |
| PostgreSQL | 16+ | https://www.postgresql.org/download |

---

## Installation

### 1. Base de données

Créer la base dans PostgreSQL :

```sql
CREATE DATABASE "ComponentCommandDb";
```

Mettre à jour la chaîne de connexion dans `ComponentsApi/appsettings.json` :

```json
"DefaultConnection": "Host=localhost;Port=5432;Database=ComponentCommandDb;Username=postgres;Password=YOUR_PASSWORD"
```

### 2. Backend (API)

```bash
cd ComponentsApi
dotnet restore
dotnet ef database update   # applique les migrations
dotnet run --launch-profile http
```

L'API écoute sur **http://localhost:5064**.

> **Entity Framework Core tools** requis pour les migrations :
> ```bash
> dotnet tool install --global dotnet-ef
> ```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Éditer .env si l'API tourne sur un port différent
npm run dev
```

Le frontend écoute sur **http://localhost:5173**.  
Pour l'exposer sur le réseau (accès mobile) : `npm run dev -- --host`

---

## Variables d'environnement

### Frontend (`frontend/.env`)

| Variable | Description | Défaut |
|---|---|---|
| `VITE_API_URL` | URL de l'API backend | `http://localhost:5064` |

---

## Structure du projet

```
componentsCommand/
├── ComponentsApi/          # ASP.NET Core Web API
│   ├── Controllers/        # ProjectController, LineController, PostController,
│   │                       # PostComponentController, RequestController,
│   │                       # ComponentController, AdminController
│   ├── Models/             # Project, Line, Post, Component, PostComponent, Request
│   ├── Data/               # AppDbContext (EF Core)
│   ├── DTOs/               # CreatePostComponent, CreateRequest, UpdateRequest
│   └── Migrations/         # EF Core migrations
│
└── frontend/               # React + Vite + Tailwind CSS v4
    ├── public/
    │   └── yazaki-bg.png   # Image de fond
    └── src/
        ├── pages/
        │   ├── ScanPage.tsx        # Commander un composant (sélection Projet→Ligne→Poste)
        │   ├── ReceptionPage.tsx   # Livraison par bundle (groupé par ligne)
        │   ├── HistoryPage.tsx     # Historique des livraisons
        │   └── ManagementPage.tsx  # Admin : composants + import Excel
        ├── services/api.ts         # Axios instance
        └── types.ts                # Types TypeScript partagés
```

---

## Packages NuGet (backend)

| Package | Usage |
|---|---|
| `Microsoft.EntityFrameworkCore` | ORM |
| `Npgsql.EntityFrameworkCore.PostgreSQL` | Driver PostgreSQL |
| `Microsoft.EntityFrameworkCore.Design` | Migrations (`dotnet ef`) |
| `ClosedXML` | Import Excel |

---

## Import Excel (Admin)

Format attendu (première ligne = en-têtes ignorés) :

| Col 1 | Col 2 | Col 3 | Col 4 | Col 5 |
|---|---|---|---|---|
| Projet | Ligne | Poste | Référence composant | Catégorie (optionnel) |

L'import crée automatiquement les entités manquantes (Projet, Ligne, Poste, Composant) et les liaisons PostComponent.

---

## Logique métier — Carry-over des composants manquants

Lors de la livraison d'un bundle en réception :
- Composants **OK** → marqués `Livré`
- Composants **Manquant** → marqués `0 Stock` + **nouvelle commande pending créée automatiquement**

Ainsi les composants non livrés réapparaissent automatiquement à la prochaine commande.
