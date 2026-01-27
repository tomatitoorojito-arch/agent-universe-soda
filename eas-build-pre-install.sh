#!/bin/bash
echo "🚀 Preparando entorno de construcción..."

# Forzar la instalación de pnpm 9.0.0 globalmente
npm install -g pnpm@9.0.0

# Activar corepack y preparar la versión específica
corepack enable
corepack prepare pnpm@9.0.0 --activate

echo "✅ Entorno listo. Versión de pnpm: $(pnpm -v)"
