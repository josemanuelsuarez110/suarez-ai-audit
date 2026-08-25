# Suarez AI Audit — Quality Gate

## Validación estática

Ejecutar:

    npm run quality:static

Comprueba:

- patrones sensibles accidentales
- estructura de la plataforma
- estructura E2E
- build de producción
- presupuesto del bundle

## Validación completa

Ejecutar:

    npm run quality:full

Incluye la suite Playwright E2E completa.

## Credenciales E2E

Las credenciales locales permanecen únicamente en:

    .env.e2e

Este archivo no debe subirse a Git.

## GitHub Secrets

Configurar:

- E2E_EMAIL
- E2E_PASSWORD
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

Si el proyecto utiliza anon key:

- VITE_SUPABASE_ANON_KEY

Nunca utilizar service_role ni claves sb_secret_ en el frontend.

## Release

Antes de producción:

    npm run release:check
