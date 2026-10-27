import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import SecureStoreAdapter from './secureStorage';

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  '';

export const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || '';

export const SUPABASE_JWKS_URL =
  process.env.SUPABASE_JWKS_URL || '';

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn('Advertencia: Faltan variables de entorno de Supabase. Revisa .env');
}

// Cliente público para la aplicación móvil Expo
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_PUBLISHABLE_KEY || 'placeholder-key',
  {
    auth: {
      storage: SecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Cliente con permisos de administración (Service Role) para scripts de desarrollo
export const supabaseAdmin = SUPABASE_SECRET_KEY
  ? createClient(SUPABASE_URL || 'https://placeholder.supabase.co', SUPABASE_SECRET_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
