# 🚀 AgentUniverse APK - Guía Completa

## ¿Qué es AgentUniverse?

**AgentUniverse** es una aplicación móvil basada en **Open Manus AI** que te proporciona acceso a todas las capacidades de Manus directamente en tu teléfono:

✅ Generación de imágenes
✅ Generación de vídeos  
✅ Búsqueda web inteligente
✅ Análisis de datos
✅ Text-to-Speech
✅ OCR (extracción de texto de imágenes)
✅ LLM avanzado (Claude 3.5 Sonnet)

---

## Opción 1: APK Nativo (RECOMENDADO)

### Requisitos:
- Node.js 18+
- Android SDK
- Java Development Kit (JDK)
- Cuenta en Expo (gratuita)

### Pasos:

```bash
# 1. Instalar EAS CLI globalmente
npm install -g eas-cli

# 2. Navegar al proyecto
cd /home/ubuntu/manus-clone-mobile

# 3. Crear cuenta en Expo (si no tienes)
eas login

# 4. Construir APK para Android
eas build --platform android --local

# 5. El APK se guardará en: dist/
# Descarga el archivo .apk
```

---

## Opción 2: Acceso Web Inmediato (SIN INSTALACIÓN)

Tu aplicación está disponible en:
**https://3000-iqtosftljj8ps7335ezmy-3c32fd1c.us1.manus.computer**

Puedes:
1. ✅ Acceder desde navegador (Chrome, Firefox, Safari)
2. ✅ Agregar a pantalla de inicio (PWA)
3. ✅ Usar como aplicación nativa

### Cómo agregar a pantalla de inicio:

**Android:**
1. Abre Chrome
2. Navega a la URL
3. Menú (⋮) → "Instalar aplicación"

**iPhone:**
1. Abre Safari
2. Navega a la URL
3. Compartir → "Agregar a pantalla de inicio"

---

## Opción 3: Expo Go (Desarrollo Rápido)

```bash
# 1. Instalar Expo CLI
npm install -g expo-cli

# 2. Iniciar servidor
cd /home/ubuntu/manus-clone-mobile
expo start

# 3. En tu teléfono:
#    - Descargar "Expo Go" desde Play Store o App Store
#    - Escanear código QR que aparece en terminal
#    - ¡Listo! La app se abrirá en tu teléfono
```

---

## Características Principales

### 🎨 Generación de Imágenes
- Prompt: "Generar una imagen de un paisaje futurista"
- Usa modelos avanzados de Manus

### 🎬 Generación de Vídeos
- Prompt: "Generar un vídeo de una ciudad futurista"
- Vídeos de alta calidad

### 🔍 Búsqueda Web
- Prompt: "Buscar información sobre IA"
- Resultados en tiempo real

### 📈 Análisis de Datos
- Prompt: "Analizar estos datos: 1,2,3,4,5"
- Análisis profundo con Manus

### 🔊 Text-to-Speech
- Prompt: "Convertir a audio: Hola mundo"
- Audio natural y claro

### 📄 OCR
- Extrae texto de imágenes automáticamente
- Soporta múltiples idiomas

---

## Especificaciones Técnicas

**Stack:**
- Frontend: React 19 + Tailwind CSS 4
- Backend: Express.js + tRPC
- Base de datos: MySQL
- IA: Open Manus API

**Modelos:**
- LLM: Claude 3.5 Sonnet
- Imagen: Manus Image Generation
- Vídeo: Manus Video Generation

**Seguridad:**
- Autenticación OAuth integrada
- API Keys encriptadas
- HTTPS en todas las conexiones

---

## Solución de Problemas

### "Error: Failed to generate response"
→ Verifica que tu conexión a internet es estable

### "Error: API Key no configurada"
→ Las API Keys están integradas automáticamente

### "La app es lenta"
→ Usa la versión web para mejor rendimiento

---

## Soporte

Para problemas o preguntas:
- Visita: https://help.manus.im
- Email: support@manus.im

---

**Versión:** 2.0.0  
**Plataforma:** Manus AI  
**Última actualización:** 2026-01-24

