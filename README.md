# MATCHDAY — Mundial 2026

## Cómo desplegarlo en Railway (paso a paso)

### 1. Subir a GitHub

1. Ve a **github.com** → **New repository**
2. Ponle nombre (ej. `matchday-2026`) → **Create repository**
3. Descarga y descomprime este zip en tu ordenador
4. Abre una terminal dentro de la carpeta y ejecuta:

```bash
git init
git add .
git commit -m "primer commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/matchday-2026.git
git push -u origin main
```

Si no tienes Git instalado, descárgalo de https://git-scm.com

---

### 2. Desplegar en Railway

1. Ve a **railway.app** y regístrate (gratis con GitHub)
2. **New Project** → **Deploy from GitHub repo**
3. Selecciona tu repo `matchday-2026`
4. Railway detecta automáticamente el `railway.toml` y hace el build

---

### 3. Añadir la API key (IMPORTANTE)

Sin esto la app no carga datos reales.

1. En Railway → tu proyecto → pestaña **Variables**
2. Añade:
   - **Name**: `FOOTBALL_DATA_KEY`
   - **Value**: `eb465e11a99944f79f51a93c64203b6b`
3. Railway redespliega automáticamente

---

### 4. Ya está

Railway te da una URL pública (ej. `matchday-2026.up.railway.app`).
La app se actualiza sola cada 30 segundos con datos reales.

---

## Cómo funciona

- **Frontend** (React): se compila con Vite en la carpeta `dist/`
- **Backend** (Express): servidor Node.js que llama a football-data.org con tu API key protegida
- La key NUNCA llega al navegador — vive solo en el servidor de Railway

## Actualizar la app en el futuro

Con GitHub conectado, cualquier cambio que hagas en el repo se despliega automáticamente en Railway en 1-2 minutos.
