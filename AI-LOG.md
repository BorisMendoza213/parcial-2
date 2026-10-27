# Registro de uso de inteligencia artificial

## 2026-10-26 — Etapa 1: entorno y proyecto base

- Herramienta: opencode.
- Prompt utilizado: desarrollo por etapas del parcial "Mi Tienda", con Expo,
  TypeScript, Expo Router, SQLite, Drizzle, Supabase, SecureStore y GitHub.
- Decisión de versiones: Expo SDK 57 y Expo Router 57 para usar Expo Go durante
  la transición de SDK. Drizzle ORM 0.45.4 y Drizzle Kit 0.31.11.
- Corrección detectada: la plantilla vacía no configura Expo Router; se agregó
  manualmente el entry point, el esquema de navegación y el plugin.
- Corrección detectada: npm intentaba instalar react-dom 19.3.1, incompatible
  con React 19.2.3; se fijó react-dom 19.2.3.
- Corrección detectada: TypeScript 6 marcó `baseUrl` como obsoleto; se eliminó
  de `tsconfig.json` y se conservó el alias `@/*`.
- Verificación realizada en el proyecto final: `expo-doctor` pasó 21/21
  comprobaciones, `tsc --noEmit` terminó sin errores y se generó correctamente
  el bundle Android con `expo export`.
- Pendiente: probar en dispositivo o emulador, configurar Supabase, implementar
  autenticación, SQLite, sincronización y capturas. No se declaran pruebas de
  dispositivo ni de nube como realizadas.

## 2026-10-26 — Etapa 2: conexión a Supabase y configuración de entorno

- Herramienta: Antigravity.
- Prompt utilizado: conexión del proyecto a la instancia de Supabase del usuario.
- Variables configuradas: `.env` y `.env.local` con `EXPO_PUBLIC_SUPABASE_URL`,
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` y `SUPABASE_JWKS_URL`.
- Ajuste en cliente: en `lib/supabase.ts` se conectaron directamente todas las variables
  y constantes (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`),
  creando el cliente móvil `supabase` y el cliente administrativo `supabaseAdmin`.
- Verificación realizada: prueba de conectividad HTTPS directa con el endpoint de
  Supabase (`https://svrnbbwaecrvehqsfzfi.supabase.co`), confirmando respuesta activa
  del servicio PostgREST (código PGRST205 indicando esquema pendiente de tabla).
- Verificación de tipos: `npm run typecheck` completado con 0 errores.
- Pendiente: creación de la tabla `products` con RLS en Supabase (vía `supabase/schema.sql` o comando `npm run db:setup-supabase`) y pruebas de autenticación/sincronización en la app.
- Incorporación al código: se creó el esquema SQL en `supabase/schema.sql`, el script de automatización `scripts/setup-supabase.mjs` (`npm run db:setup-supabase`), y se mejoraron los mensajes de error en `services/sync.ts` e interfaz de inicio.
