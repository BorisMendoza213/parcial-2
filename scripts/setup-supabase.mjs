import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlPath = path.resolve(__dirname, '../supabase/schema.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const projectRef = 'svrnbbwaecrvehqsfzfi';
const token = process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_MANAGEMENT_TOKEN;

async function run() {
  if (!token) {
    console.log('------------------------------------------------------------');
    console.log('Script de configuración remota para Supabase');
    console.log('------------------------------------------------------------');
    console.log('Para ejecutar las migraciones automáticamente desde el código sin ir a la web,');
    console.log('puedes generar un Access Token personal en:');
    console.log('https://supabase.com/dashboard/account/tokens');
    console.log('');
    console.log('Luego ejecútalo así:');
    console.log('  $env:SUPABASE_ACCESS_TOKEN="tu_token"; npm run db:setup-supabase');
    console.log('');
    console.log('O bien, copia el archivo generado en:');
    console.log('  supabase/schema.sql');
    console.log('y pégalo directamente en el SQL Editor de tu proyecto Supabase.');
    console.log('------------------------------------------------------------');
    return;
  }

  console.log(`Aplicando esquema a Supabase (Proyecto: ${projectRef})...`);

  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Error en la API de Supabase (${res.status}): ${errText}`);
    }

    console.log('✅ ¡Tabla "products" y políticas RLS creadas con éxito en Supabase!');
  } catch (error) {
    console.error('❌ Error al aplicar el esquema:', error.message);
  }
}

run();
