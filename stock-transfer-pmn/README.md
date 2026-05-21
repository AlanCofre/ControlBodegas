# 📦 StockFlow PMN - Sistema de Transferencias de Inventario

Sistema moderno de gestión de transferencias de inventario construido con React, TypeScript, Vite y Tailwind CSS.

## 🚀 Características

- ✅ **Dashboard** - Resumen de estadísticas y operaciones
- 📋 **Gestión de Transferencias** - Crear, editar, aprobar transferencias
- 📊 **Reportes** - Análisis y reportes de transferencias
- 🔐 **Autenticación** - Sistema de roles y permisos
- 🎨 **UI Moderna** - Interfaz con Tailwind CSS
- 📱 **Responsive** - Compatible con dispositivos móviles

## 🛠 Stack Tecnológico

- **Frontend Framework**: React 19
- **Language**: TypeScript 6.0
- **Build Tool**: Vite 8.0
- **Styling**: Tailwind CSS 4.3
- **Routing**: React Router 7.15
- **Linting**: ESLint con TypeScript
- **Package Manager**: npm

## 📋 Requisitos

- Node.js 18+
- npm 10+

## 🚀 Instalación y Setup

### 1. Clonar repositorio

```bash
git clone <repo-url>
cd ControlBodegas/stock-transfer-pmn
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear archivo `.env` (opcional)

```bash
cp .env.example .env.development
```

### 4. Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Scripts disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor con HMR

# Build
npm run build        # Compila para producción

# Lint
npm run lint         # Ejecuta ESLint

# Preview
npm run preview      # Vista previa del build
```

## 📁 Estructura del Proyecto

Consulta [ARCHITECTURE.md](./ARCHITECTURE.md) para una descripción detallada de la estructura del proyecto.

## 🏗️ Arquitectura

El proyecto utiliza una arquitectura modular escalable con los siguientes patrones:

- **Módulos independientes** - Cada módulo es autocontenido
- **Separación de responsabilidades** - Componentes, servicios, tipos, etc.
- **Tipos TypeScript** - Tipado fuerte en toda la aplicación
- **Importaciones limpias** - Uso de índices para facilitar importaciones

## 🔌 Módulos principales

### Dashboard
Resumen de operaciones y estadísticas generales.

**Ubicación**: `src/modules/dashboard/`

### Transferencias
Gestión completa de transferencias de inventario.

**Ubicación**: `src/modules/transferencias/`

### Inventario
*Por implementar*

### Auditoría
*Por implementar*

### Autenticación
*Por implementar*

## 🎯 Próximos pasos

- [ ] Implementar módulo de inventario
- [ ] Implementar módulo de auditoría
- [ ] Implementar sistema de autenticación
- [ ] Agregar servicios de API
- [ ] Implementar gestión de estado (Zustand/Redux)
- [ ] Agregar pruebas unitarias
- [ ] Agregar pruebas E2E

## 💡 Convenciones de Código

- **Componentes**: PascalCase (`DashboardPage.tsx`)
- **Funciones**: camelCase (`formatDate.ts`)
- **Tipos**: PascalCase (`Transfer.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`TRANSFER_STATUS.ts`)
- **Importaciones type-only**: Usar `import type` para tipos (TypeScript 5.0+)

## 🤝 Contribuir

1. Crear una rama para la característica (`git checkout -b feature/nueva-caracteristica`)
2. Realizar commits atómicos (`git commit -m 'Add feature'`)
3. Hacer push a la rama (`git push origin feature/nueva-caracteristica`)
4. Abrir un Pull Request


