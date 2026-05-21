# Estructura de Carpetas del Proyecto

Este proyecto utiliza una arquitectura modular escalable.

## 📁 Directorios principales

### `/src/app`
Configuración principal de la aplicación:
- `layouts/` - Layouts principales (MainLayout, etc.)
- `routes/` - Definición de rutas
- `providers/` - Proveedores (Redux, Context, etc.)
- `store/` - Almacenamiento global (si aplica)

### `/src/modules`
Módulos de negocio independientes:
- `dashboard/` - Dashboard principal
- `transferencias/` - Gestión de transferencias
- `inventario/` - Gestión de inventario
- `auditoria/` - Registros de auditoría
- `autenticacion/` - Autenticación y autorización

### `/src/shared`
Recursos compartidos entre módulos:
- `components/` - Componentes reutilizables
- `constants/` - Constantes globales
- `types/` - Tipos compartidos
- `hooks/` - Hooks reutilizables
- `utils/` - Funciones utilitarias
- `ui/` - Componentes de UI base

### `/public`
Archivos estáticos (imágenes, fuentes, etc.)

## 🔄 Estructura de módulos

Cada módulo sigue este patrón:

```
modulo/
├── pages/          # Componentes de página
├── components/     # Componentes locales del módulo
├── hooks/          # Hooks personalizados
├── services/       # Servicios de API
├── state/          # Gestión de estado local
├── types/          # Tipos TypeScript
├── utils/          # Funciones utilitarias
├── constants/      # Constantes del módulo
├── mocks/          # Datos de prueba
├── schemas/        # Esquemas de validación
├── index.ts        # Exportaciones públicas
└── README.md       # Documentación del módulo
```

## 📝 Convenciones

- **Componentes**: PascalCase (ej: `DashboardPage.tsx`)
- **Funciones**: camelCase (ej: `formatDate.ts`)
- **Tipos**: PascalCase (ej: `Transfer.ts`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `TRANSFER_STATUS.ts`)

## 🚀 Iniciando nuevas características

1. Crear carpeta en `/src/modules/nueva-caracteristica`
2. Seguir la estructura de carpetas del patrón
3. Crear `index.ts` con las exportaciones públicas
4. Crear `README.md` documentando la característica
5. Integrar en rutas si es necesario
