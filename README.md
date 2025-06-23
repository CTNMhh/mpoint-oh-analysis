
# MPoint 🚀

## 📋 Voraussetzungen

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installiert und gestartet
- Git (optional für Versionskontrolle)
- Windows, macOS oder Linux

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 mit App Router
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Datenbank**: PostgreSQL 15
- **Datenbank GUI**: Adminer
- **Container**: Docker & Docker Compose
- **Sprache**: TypeScript

## 🚀 Quick Start

### 1. Repository klonen (oder ZIP herunterladen)

1. Erstelle einen neuen Ordner
2. Öffne diesen Ordner in Visual Studio Code (VSC)
3. Öffne das Terminal in VSC mit `Strg + Shift + Ö`
4. Führe diesen Befehl aus (ersetze `<dein-repository-url>` mit der echten GitHub URL):

```bash
git clone <dein-repository-url>
```

### 2. Docker Container starten

1. Öffne das Terminal in VSC mit `Strg + Shift + Ö`
2. Starte Docker Compose mit diesem Befehl:

```bash
docker-compose up
```

Das war's! Die Installation läuft automatisch beim ersten Start.

### 3. Zugriff auf die Services

- **Next.js App**: http://localhost:3000
- **Adminer (Datenbank GUI)**: http://localhost:8080


### 📊 Git Graph in VSCode
Installation

Öffne VSCode
Gehe zu Extensions (Strg + Shift + X)
Suche nach "Git Graph"
Installiere die Extension von mhutchie
VSCode neu laden (falls erforderlich)

Verwendung

Git Graph öffnen:

Klicke auf das Git Graph Icon in der Source Control Sidebar
Oder: Strg + Shift + P → "Git Graph: View Git Graph"



Wichtige Features

Commits visualisieren: Zeigt alle Branches und Commits als Graph
Branch Management: Rechtsklick auf Commits für Branch-Operationen
Commit Details: Klick auf Commits zeigt Änderungen
Merge/Rebase: Visuell Branches zusammenführen

## 🗄️ Datenbank-Zugriff

### Adminer Web-Interface

1. Öffne http://localhost:8080
2. Login-Daten:
   - **System**: PostgreSQL
   - **Server**: `db`
   - **Benutzername**: `postgres`
   - **Passwort**: `password`
   - **Datenbank**: `mpoint_db`

### Verbindung aus der App

Die Datenbank-URL ist bereits konfiguriert:
```
DATABASE_URL=postgresql://postgres:password@db:5432/mpoint_db
```

## 📁 Projekt-Struktur

```
dein-projekt-ordner/
├── docker-compose.yml    # Docker Konfiguration
├── README.md            # Diese Datei
└── mpoint-app/         # Next.js Projekt (wird automatisch erstellt)
    ├── src/
    │   ├── app/        # App Router Pages
    │   │   ├── page.tsx
    │   │   ├── layout.tsx
    │   │   └── api/    # API Routes
    │   └── lib/        # Utilities
    ├── public/         # Statische Dateien
    ├── prisma/         # Prisma Schema (optional)
    └── package.json    # Dependencies
```

## 🐳 Docker Befehle

### Grundlegende Befehle

```bash
# Container starten
docker-compose up

# Container im Hintergrund starten
docker-compose up -d

# Container stoppen
docker-compose down

# Container stoppen und Daten löschen
docker-compose down -v

# Logs anzeigen
docker-compose logs -f

# Nur Datenbank-Logs
docker-compose logs -f db
```

### Container-Verwaltung

```bash
# Status anzeigen
docker ps

# In Next.js Container
docker exec -it mpoint-nextjs sh

# In PostgreSQL Container
docker exec -it mpoint-postgres psql -U postgres -d mpoint_db

# Container neu starten
docker-compose restart app
```



### Ports ändern

In `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Next.js auf Port 3001
  - "8081:8080"  # Adminer auf Port 8081
```

## 🚨 Troubleshooting



### Port bereits belegt

```bash
# Prüfe welcher Prozess den Port nutzt (Windows)
netstat -ano | findstr :3000

# Ändere den Port in docker-compose.yml
```

### Datenbank-Verbindung fehlgeschlagen

1. Prüfe ob die Container laufen: `docker ps`
2. Prüfe die Logs: `docker-compose logs db`
3. Stelle sicher, dass du `db` als Host verwendest, nicht `localhost`

