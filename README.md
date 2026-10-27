# Parcial 2 — Mi Tienda

Aplicación móvil de inventario para una tienda de barrio, con autenticación en
Supabase, almacenamiento local en SQLite y sincronización manual con la nube.

> Estado: Etapa 1 y 2 completadas: proyecto Expo, TypeScript, Expo Router,
> SQLite local (Drizzle ORM) y conexión a Supabase.

## Tecnologías

- React Native con Expo y TypeScript
- Expo Router
- SQLite y Drizzle ORM
- Supabase Auth y Supabase Database
- Expo SecureStore
- Git y GitHub

## Requisitos

- Node.js LTS
- npm
- Expo Go en un dispositivo Android o iOS, o un emulador Android
- Cuenta y proyecto en Supabase

## Instalación

```bash
npm install
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar los valores del proyecto de
Supabase. El archivo `.env` no debe subirse a GitHub.

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_tu_clave
```

## Ejecución

```bash
npx expo start --clear
```

## Scripts

- `npm start`: inicia Expo.
- `npm run start`: inicia Expo.
- `npm run typecheck`: valida TypeScript.
- `npm run db:generate`: genera una migración de Drizzle.
- `npm run db:setup-supabase`: ejecuta la configuración de esquema en Supabase.

## Estado de las capturas

Las siete capturas se agregarán a la carpeta `capturas/` cuando las pantallas
y los flujos estén terminados.
