#!/bin/bash
echo "🚀 Limpiando y preparando entorno..."

# Eliminar cualquier rastro de lockfile que haya quedado
rm -f pnpm-lock.yaml package-lock.json yarn.lock

# Instalar pnpm 9 si es posible, pero no fallar si no se puede
npm install -g pnpm@9.0.0 || echo "⚠️ No se pudo instalar pnpm 9, usando el del sistema"

echo "✅ Entorno listo para instalación limpia"
