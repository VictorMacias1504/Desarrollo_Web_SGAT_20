# SGAT – Sistema de Gestión de Activos Tecnológicos

**Desarrollo Web Full Stack**  
Victor Manuel Macias Bonilla · Luis Toscano  
Universidad de la Costa – CUC · 2026

---

## Descripción

El SGAT es una aplicación web full-stack que permite a una organización llevar control centralizado de sus equipos tecnológicos. Cubre el ciclo de vida completo de cada activo: desde su adquisición hasta su baja definitiva, con seguimiento de mantenimientos, asignación a usuarios y alertas de garantía.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + React Router v6 |
| Backend | Node.js + Express.js |
| ORM | Sequelize |
| Base de datos | SQLite (archivo local) |
| Autenticación | JWT + bcryptjs |
| HTTP Client | Axios |

## Estructura del proyecto

```
sgat/
├── backend/
│   ├── config/
│   │   └── database.js        # Conexión Sequelize + SQLite
│   ├── middleware/
│   │   └── auth.js            # Verificación JWT + rol admin
│   ├── models/
│   │   ├── index.js           # Relaciones entre modelos
│   │   ├── Usuario.js
│   │   ├── Activo.js
│   │   └── Mantenimiento.js
│   ├── routes/
│   │   ├── auth.js            # POST /login, GET /me
│   │   ├── activos.js         # CRUD activos + estadísticas
│   │   ├── mantenimientos.js  # CRUD mantenimientos
│   │   └── usuarios.js        # CRUD usuarios
│   ├── seeders/
│   │   └── seed.js            # Datos iniciales de prueba
│   ├── server.js              # Entry-point Express
│   └── .env                   # Variables de entorno
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js      # Axios + interceptor JWT
    │   ├── components/
    │   │   ├── Layout.jsx     # Sidebar + navegación
    │   │   └── ui.jsx         # Componentes reutilizables
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Activos.jsx
    │   │   ├── Mantenimientos.jsx
    │   │   └── Usuarios.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── vite.config.js
```

---

## Instalación local

### Requisitos previos
- Node.js v18 o superior
- npm v9 o superior
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/sgat.git
cd sgat
```

### 2. Configurar y ejecutar el backend

```bash
cd backend
npm install
```

Crear el archivo `.env` (copiar desde `.env.example`):

```bash
cp .env.example .env
```

Editar `.env` con tus valores:

```
PORT=3001
JWT_SECRET=una_clave_secreta_larga_y_segura
JWT_EXPIRES_IN=8h
NODE_ENV=development
```

Poblar la base de datos con datos de prueba (opcional pero recomendado):

```bash
npm run seed
```

Iniciar el servidor:

```bash
npm run dev       # desarrollo con nodemon
# o
npm start         # producción
```

El backend estará disponible en: `http://localhost:3001`

### 3. Configurar y ejecutar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

### 4. Credenciales por defecto

| Campo | Valor |
|-------|-------|
| Email | admin@sgat.com |
| Contraseña | Admin1234 |
| Rol | Administrador |

---

## Endpoints de la API

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Usuario actual |

### Activos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/activos` | Listar con filtros y paginación |
| GET | `/api/activos/stats/resumen` | KPIs para el dashboard |
| GET | `/api/activos/:id` | Detalle de un activo |
| POST | `/api/activos` | Crear activo (admin) |
| PUT | `/api/activos/:id` | Actualizar activo (admin) |
| DELETE | `/api/activos/:id` | Baja lógica (admin) |

### Mantenimientos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/mantenimientos` | Listar con filtros |
| POST | `/api/mantenimientos` | Crear registro (admin) |
| PUT | `/api/mantenimientos/:id` | Actualizar (admin) |
| DELETE | `/api/mantenimientos/:id` | Eliminar (admin) |

### Usuarios
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/usuarios` | Listar usuarios (admin) |
| POST | `/api/usuarios` | Crear usuario (admin) |
| PUT | `/api/usuarios/:id` | Actualizar (admin) |
| PATCH | `/api/usuarios/:id/estado` | Activar/desactivar (admin) |

---

## Despliegue en producción

### Backend en Render (gratuito)

1. Crear cuenta en [render.com](https://render.com)
2. New → **Web Service** → conectar repositorio GitHub
3. Configuración:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
4. En **Environment Variables** agregar:
   - `JWT_SECRET` = (clave segura generada)
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = (URL de tu frontend en Vercel)
5. Deploy

### Frontend en Vercel (gratuito)

1. Crear cuenta en [vercel.com](https://vercel.com)
2. New Project → importar repositorio GitHub
3. Configuración:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
4. En **Environment Variables** agregar:
   - `VITE_API_URL` = (URL de tu backend en Render + `/api`)
5. Deploy

---

## Funcionalidades

- **Dashboard** con 6 KPIs en tiempo real, distribución por tipo y actividad reciente
- **Inventario de activos** con CRUD completo, filtros combinables, paginación y baja lógica
- **Gestión de mantenimientos** preventivos y correctivos con seguimiento de estado
- **Gestión de usuarios** con roles admin/viewer y activación/desactivación
- **Autenticación JWT** con tokens de 8 horas y protección de rutas por rol
- **Alertas** de garantías próximas a vencer (90 días)

## Decisiones de diseño

- **Baja lógica:** los activos nunca se eliminan físicamente; cambian a estado "Dado de baja" para mantener trazabilidad histórica.
- **IDs legibles:** formato `ACT-001` en lugar de UUIDs, facilita la comunicación dentro del equipo.
- **SQLite embebida:** permite despliegue sin servidor de base de datos adicional, ideal para proyectos académicos o empresas pequeñas.
- **Roles simples:** admin (acceso completo) y viewer (solo lectura), suficiente para el alcance definido.
