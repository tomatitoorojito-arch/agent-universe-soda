#!/bin/bash
echo "🚀 Preparando entorno de construcción para Expo..."

# Asegurar que estamos usando pnpm v8 para máxima compatibilidad con el lockfile generado
npm install -g pnpm@8.15.4

# Habilitar corepack y preparar la versión
corepack enable
corepack prepare pnpm@8.15.4 --activate

echo "✅ pnpm configurado: $(pnpm -v)"
