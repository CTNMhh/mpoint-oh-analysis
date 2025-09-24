// scripts/generate-dev-sitemap.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Konfiguration
const config = {
  // Basis-Verzeichnisse für Next.js
  pagesDir: 'pages',
  appDir: 'app',
  srcDir: 'src', // Falls src/ Verzeichnis verwendet wird
  
  // Ausgabe
  outputDir: 'public',
  outputFile: 'dev-sitemap.html',
  
  // Zu ignorierende Patterns
  ignorePaths: [
    '_app',
    '_document',
    '_error',
    '404',
    '500',
    'api/**',
    '*.test.*',
    '*.spec.*'
  ]
};

class NextJsSitemapGenerator {
  constructor() {
    this.routes = new Map();
    this.componentUsage = new Map();
  }

  // Hauptfunktion
  async generate() {
    console.log('🔍 Scanning Next.js routes...\n');
    
    // Prüfe welche Struktur verwendet wird (pages oder app directory)
    const usesPagesRouter = fs.existsSync(config.pagesDir) || 
                           fs.existsSync(path.join(config.srcDir, config.pagesDir));
    const usesAppRouter = fs.existsSync(config.appDir) || 
                         fs.existsSync(path.join(config.srcDir, config.appDir));
    
    if (usesPagesRouter) {
      await this.scanPagesDirectory();
    }
    
    if (usesAppRouter) {
      await this.scanAppDirectory();
    }
    
    // Scanne nach verwendeten Komponenten
    await this.scanComponentUsage();
    
    // Generiere HTML
    const html = this.generateHTML();
    
    // Speichere Datei
    this.saveFile(html);
    
    console.log(`\n✅ Sitemap generated: ${path.join(config.outputDir, config.outputFile)}`);
    console.log(`📊 Total routes found: ${this.routes.size}`);
  }

  // Scanne Pages Router Struktur
  async scanPagesDirectory() {
    const pagesPath = fs.existsSync(config.pagesDir) 
      ? config.pagesDir 
      : path.join(config.srcDir, config.pagesDir);
    
    if (!fs.existsSync(pagesPath)) return;
    
    console.log(`📁 Scanning Pages Router: ${pagesPath}`);
    
    const files = glob.sync('**/*.{js,jsx,ts,tsx}', {
      cwd: pagesPath,
      ignore: config.ignorePaths
    });
    
    files.forEach(file => {
      const route = this.fileToRoute(file, 'pages');
      const fullPath = path.join(pagesPath, file);
      
      this.routes.set(route, {
        type: 'pages',
        file: fullPath,
        route: route,
        isDynamic: route.includes('['),
        components: [],
        lastModified: fs.statSync(fullPath).mtime
      });
    });
  }

  // Scanne App Router Struktur
  async scanAppDirectory() {
    const appPath = fs.existsSync(config.appDir) 
      ? config.appDir 
      : path.join(config.srcDir, config.appDir);
    
    if (!fs.existsSync(appPath)) return;
    
    console.log(`📁 Scanning App Router: ${appPath}`);
    
    const files = glob.sync('**/page.{js,jsx,ts,tsx}', {
      cwd: appPath
    });
    
    files.forEach(file => {
      const route = this.fileToRoute(file, 'app');
      const fullPath = path.join(appPath, file);
      
      this.routes.set(route, {
        type: 'app',
        file: fullPath,
        route: route,
        isDynamic: route.includes('['),
        hasLayout: fs.existsSync(path.join(path.dirname(fullPath), 'layout.tsx')) ||
                  fs.existsSync(path.join(path.dirname(fullPath), 'layout.js')),
        hasLoading: fs.existsSync(path.join(path.dirname(fullPath), 'loading.tsx')) ||
                   fs.existsSync(path.join(path.dirname(fullPath), 'loading.js')),
        hasError: fs.existsSync(path.join(path.dirname(fullPath), 'error.tsx')) ||
                 fs.existsSync(path.join(path.dirname(fullPath), 'error.js')),
        components: [],
        lastModified: fs.statSync(fullPath).mtime
      });
    });
  }

  // Konvertiere Dateipfad zu Route
  fileToRoute(file, type) {
    let route = file
      .replace(/\.(js|jsx|ts|tsx)$/, '')
      .replace(/\/page$/, '') // App Router
      .replace(/\/index$/, '') // Pages Router
      .replace(/\\/g, '/');
    
    // Spezielle Behandlung für dynamische Routen
    route = route
      .replace(/\[\.\.\.(.+?)\]/g, '*') // Catch-all routes
      .replace(/\[(.+?)\]/g, ':$1'); // Dynamic segments
    
    return '/' + (route || '');
  }

  // Scanne nach Komponenten-Verwendung
  async scanComponentUsage() {
    console.log('🔎 Analyzing component usage...');
    
    for (const [route, data] of this.routes.entries()) {
      const content = fs.readFileSync(data.file, 'utf-8');
      
      // Finde importierte Komponenten
      const imports = content.match(/import\s+.+\s+from\s+['"](@\/components|\.\.\/components|\.\/components).+['"]/g) || [];
      
      imports.forEach(imp => {
        const componentMatch = imp.match(/import\s+(?:{[^}]+}|\w+)\s+from\s+['"](.*)['"]/);
        if (componentMatch) {
          data.components.push(componentMatch[1]);
          
          // Tracke welche Routes welche Komponenten nutzen
          if (!this.componentUsage.has(componentMatch[1])) {
            this.componentUsage.set(componentMatch[1], []);
          }
          this.componentUsage.get(componentMatch[1]).push(route);
        }
      });
    }
  }

  // Generiere HTML Übersicht
  generateHTML() {
    const sortedRoutes = Array.from(this.routes.entries()).sort((a, b) => 
      a[0].localeCompare(b[0])
    );
    
    const routesByType = {
      static: sortedRoutes.filter(([_, data]) => !data.isDynamic),
      dynamic: sortedRoutes.filter(([_, data]) => data.isDynamic)
    };
    
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Next.js Development Sitemap</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 2.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1.5rem;
            border-radius: 10px;
            text-align: center;
        }
        .stat-card .number {
            font-size: 2rem;
            font-weight: bold;
        }
        .stat-card .label {
            opacity: 0.9;
            margin-top: 0.5rem;
        }
        .route-section {
            margin: 2rem 0;
        }
        .route-section h2 {
            color: #555;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e0e0e0;
        }
        .route-grid {
            display: grid;
            gap: 1rem;
        }
        .route-card {
            background: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 1rem;
            transition: all 0.3s ease;
        }
        .route-card:hover {
            transform: translateX(5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border-color: #667eea;
        }
        .route-path {
            font-weight: 600;
            color: #333;
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
            font-family: 'Courier New', monospace;
        }
        .route-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        .badge-pages { background: #e3f2fd; color: #1976d2; }
        .badge-app { background: #f3e5f5; color: #7b1fa2; }
        .badge-dynamic { background: #fff3e0; color: #f57c00; }
        .badge-static { background: #e8f5e9; color: #388e3c; }
        .badge-layout { background: #fce4ec; color: #c2185b; }
        .badge-loading { background: #e0f2f1; color: #00796b; }
        .badge-error { background: #ffebee; color: #c62828; }
        .file-path {
            color: #666;
            font-size: 0.9rem;
            margin-top: 0.5rem;
            font-family: monospace;
        }
        .components {
            margin-top: 0.5rem;
            color: #666;
            font-size: 0.9rem;
        }
        .search-box {
            margin: 2rem 0;
            position: relative;
        }
        .search-box input {
            width: 100%;
            padding: 1rem 3rem 1rem 1rem;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        .search-box input:focus {
            outline: none;
            border-color: #667eea;
        }
        .timestamp {
            text-align: center;
            color: #666;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #e0e0e0;
        }
        .component-usage {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 2px solid #e0e0e0;
        }
        .component-list {
            display: grid;
            gap: 1rem;
            margin-top: 1rem;
        }
        .component-item {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
        .component-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 0.5rem;
        }
        .usage-routes {
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚡ Next.js Development Sitemap</h1>
        
        <div class="stats">
            <div class="stat-card">
                <div class="number">${this.routes.size}</div>
                <div class="label">Total Routes</div>
            </div>
            <div class="stat-card">
                <div class="number">${routesByType.static.length}</div>
                <div class="label">Static Routes</div>
            </div>
            <div class="stat-card">
                <div class="number">${routesByType.dynamic.length}</div>
                <div class="label">Dynamic Routes</div>
            </div>
            <div class="stat-card">
                <div class="number">${this.componentUsage.size}</div>
                <div class="label">Shared Components</div>
            </div>
        </div>

        <div class="search-box">
            <input type="text" id="searchInput" placeholder="🔍 Suche nach Route oder Komponente..." onkeyup="filterRoutes()">
        </div>

        <div class="route-section">
            <h2>📁 Static Routes</h2>
            <div class="route-grid" id="staticRoutes">
                ${routesByType.static.map(([route, data]) => this.generateRouteCard(route, data)).join('')}
            </div>
        </div>

        <div class="route-section">
            <h2>🔄 Dynamic Routes</h2>
            <div class="route-grid" id="dynamicRoutes">
                ${routesByType.dynamic.map(([route, data]) => this.generateRouteCard(route, data)).join('')}
            </div>
        </div>

        ${this.componentUsage.size > 0 ? `
        <div class="component-usage">
            <h2>🧩 Component Usage Analysis</h2>
            <div class="component-list">
                ${Array.from(this.componentUsage.entries()).map(([component, routes]) => `
                    <div class="component-item">
                        <div class="component-name">${component}</div>
                        <div class="usage-routes">Used in: ${routes.join(', ')}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <div class="timestamp">
            Generated: ${new Date().toLocaleString('de-DE')} | 
            Next.js Project Analysis
        </div>
    </div>

    <script>
        function filterRoutes() {
            const input = document.getElementById('searchInput').value.toLowerCase();
            const cards = document.querySelectorAll('.route-card');
            
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(input) ? 'block' : 'none';
            });
        }

        // Highlight bei Klick
        document.querySelectorAll('.route-card').forEach(card => {
            card.addEventListener('click', function() {
                const path = this.querySelector('.file-path').textContent;
                navigator.clipboard.writeText(path);
                
                // Visual feedback
                const original = this.style.background;
                this.style.background = '#e8f5e9';
                setTimeout(() => {
                    this.style.background = original;
                }, 300);
            });
        });
    </script>
</body>
</html>`;
  }

  // Generiere einzelne Route-Karte
  generateRouteCard(route, data) {
    return `
    <div class="route-card" data-route="${route}">
        <div class="route-path">${route}</div>
        <div class="route-meta">
            <span class="badge badge-${data.type}">${data.type}</span>
            <span class="badge badge-${data.isDynamic ? 'dynamic' : 'static'}">
                ${data.isDynamic ? 'dynamic' : 'static'}
            </span>
            ${data.hasLayout ? '<span class="badge badge-layout">has layout</span>' : ''}
            ${data.hasLoading ? '<span class="badge badge-loading">has loading</span>' : ''}
            ${data.hasError ? '<span class="badge badge-error">has error</span>' : ''}
        </div>
        <div class="file-path">${data.file}</div>
        ${data.components.length > 0 ? `
            <div class="components">Components: ${data.components.join(', ')}</div>
        ` : ''}
    </div>`;
  }

  // Speichere HTML Datei
  saveFile(html) {
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    const outputPath = path.join(config.outputDir, config.outputFile);
    fs.writeFileSync(outputPath, html);
  }
}

// Führe Generator aus
const generator = new NextJsSitemapGenerator();
generator.generate().catch(console.error);

// Export für mögliche Verwendung als Modul
module.exports = NextJsSitemapGenerator;