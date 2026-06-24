# 🐾 Mascotas Felices

App de mascota virtual gamificada para niños. Funciona como PWA (se instala en el celular) y sincroniza automáticamente cuando hay internet.

## Stack
- **Frontend:** React + Vite + TailwindCSS + shadcn/ui
- **Backend:** Express.js + Node.js
- **Base de datos:** PostgreSQL (Neon)
- **Hosting:** Render.com (gratis)
- **Offline:** PWA con Service Worker + cola de sincronización

---

## 🚀 Despliegue paso a paso

### Paso 1 — Base de datos en Neon (gratis)

1. Ve a [neon.tech](https://neon.tech) y crea una cuenta
2. Crea un nuevo proyecto llamado `mascotas-felices`
3. En el dashboard, copia el **Connection string** (empieza con `postgresql://`)
4. Guárdalo, lo necesitarás en el Paso 3

### Paso 2 — Subir a GitHub

```bash
# En la carpeta del proyecto:
git init
git add .
git commit -m "Initial commit - Mascotas Felices"

# Crea un repositorio en github.com y luego:
git remote add origin https://github.com/TU_USUARIO/mascotas-felices.git
git push -u origin main
```

### Paso 3 — Desplegar en Render.com (gratis)

1. Ve a [render.com](https://render.com) y crea una cuenta (con tu cuenta de GitHub)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio `mascotas-felices`
4. Render detectará el `render.yaml` automáticamente. Confirma la configuración.
5. En **Environment Variables**, agrega:
   - `DATABASE_URL` → pega el Connection string de Neon
   - `SESSION_SECRET` → Render lo genera solo (ya configurado en render.yaml)
   - `NODE_ENV` → `production` (ya configurado)
6. Click **"Create Web Service"**
7. Render construye y despliega (~5 min la primera vez)

### Paso 4 — Crear tablas en la base de datos

Una vez desplegado, en el **Shell** de Render (o localmente con el DATABASE_URL de Neon):

```bash
# Localmente, con el .env configurado:
npm run db:push
```

Esto crea todas las tablas automáticamente.

### Paso 5 — Instalar como app en el celular

1. Abre la URL de Render en Chrome (Android) o Safari (iPhone)
2. Chrome: menú (⋮) → "Agregar a pantalla de inicio"
3. Safari: botón compartir → "Añadir a pantalla de inicio"

La app se instala y funciona offline. Cuando vuelve el internet, sincroniza automáticamente.

---

## 🔄 Actualizaciones futuras

Solo haz push a GitHub:
```bash
git add .
git commit -m "Descripción del cambio"
git push
```
Render redespliega automáticamente.

---

## ⚙️ Desarrollo local

```bash
# Instalar dependencias
npm install

# Crear .env con tu DATABASE_URL de Neon
cp .env.example .env
# Editar .env y poner tu DATABASE_URL real

# Crear tablas
npm run db:push

# Iniciar servidor de desarrollo
npm run dev
```
