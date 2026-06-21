# Sistema de Transferencia de Stock y Consistencia de Inventario

## Descripción del Proyecto

Este proyecto consiste en el desarrollo de un **Prototipo Mínimo Viable (PMV)** completamente funcional para un sistema de gestión de transferencias de stock entre bodegas.

A diferencia de un prototipo puramente estático o simulado, este PMV está integrado directamente con un backend real basado en **Supabase** (Base de Datos PostgreSQL, Autenticación y Triggers), lo que permite:

- Recorrer el flujo operacional completo con datos persistentes y reales.
- Gestionar usuarios, sesiones y roles de acceso reales.
- Realizar validaciones de stock directas contra la base de datos.
- Registrar un historial de auditoría inmutable de todas las acciones del sistema.
- Mostrar la trazabilidad física y consistencia del inventario entre múltiples bodegas.

El foco del proyecto está en **demostrar la lógica operacional, control empresarial y consistencia del negocio** sobre una arquitectura robusta y moderna.

---

# Objetivo del PMV

El PMV permite realizar las siguientes operaciones reales:

- **Autenticación e Identidad**: Inicio de sesión con credenciales, registro de nuevos usuarios y asignación de roles de negocio (Supervisor, Operador, Transportista, Administrador).
- **Gestión de Transferencias**: Crear solicitudes de transferencia, validando de forma interactiva la existencia y disponibilidad de stock en la bodega origen.
- **Flujo de Decisiones**: Flujo completo de aprobación/rechazo por parte de supervisores, reserva de stock, despacho y recepción física.
- **Resolución de Diferencias**: Registro de recepción que calcula de forma automática discrepancias de stock y genera alertas.
- **Control y Auditoría**: Registro persistente y detallado de cada acción del flujo operacional con trazabilidad de actores y marcas de tiempo.
- **Ajustes de Inventario**: Permite a los supervisores realizar ajustes manuales directos en el stock, justificando y auditando la acción.

---

# Alcance del PMV

## Componentes Incluidos

- **Backend Integrado**: Base de datos relacional y sistema de autenticación persistente.
- **Gestión de Sesiones**: Autenticación persistente y vinculación automática de usuarios de Supabase Auth a perfiles públicos (`usuarios`).
- **Control de Inventario**: Consulta, reserva y descuento automático de stock en las bodegas según el flujo de la transferencia.
- **Seguridad por Roles**: Restricciones a nivel de UI y lógica de negocio según el rol asignado (ej. solo el operador de la bodega origen puede realizar la reserva de stock).
- **Consistencia y Concurrencia**: Control de stock concurrente a nivel de base de datos para prevenir inconsistencias.
- **Historial de Auditoría**: Visualización interactiva y filtro de logs de auditoría en tiempo real.

## Fuera de Alcance en esta Etapa

- Integraciones con sistemas ERP de terceros (SAP, Oracle, etc.).
- Control físico automatizado (lectores de código de barras, integración con WMS externo).
- Algoritmos avanzados de optimización de rutas para transportistas.
- Infraestructura empresarial compleja en servidores dedicados (se aprovecha el modelo serverless de Supabase).

---

# Estrategia Tecnológica

## Integración Directa con Backend Serverless (Supabase)

La lógica del sistema reside en el frontend (React + TypeScript) y se integra directamente con Supabase para el almacenamiento relacional de datos y la autenticación de usuarios. Las reglas operacionales se validan tanto en el cliente como mediante la lógica de base de datos y disparadores (triggers) SQL.

Esta arquitectura es ideal para escalar de forma rápida sin necesidad de un backend personalizado complejo (como Java/Spring Boot) en etapas tempranas.

---

# Stack Tecnológico

El proyecto está construido con herramientas modernas de alto rendimiento:

### Core Frameworks & Tools
| Tecnología | Propósito | Versión / Detalle |
|---|---|---|
| **React** | Biblioteca principal para la interfaz de usuario | v19 |
| **Vite** | Herramienta de compilación y servidor local ultra rápido | v8.0 |
| **TypeScript** | Programación con tipado estricto para evitar errores | v6.0 |
| **Tailwind CSS** | Estilizado y diseño moderno responsivo | v4.3 |
| **React Router** | Enrutamiento e historial de navegación | v7.15 |
| **Context API** | Gestión de estado global y sincronización de datos | React Core |

### Backend & Persistencia (BaaS)
| Servicio/Herramienta | Propósito | Versión / Detalle |
|---|---|---|
| **Supabase Auth** | Autenticación robusta y gestión de sesiones | Supabase |
| **PostgreSQL** | Base de datos relacional para consistencia e inventarios | Supabase |
| **SQL Triggers** | Creación y vinculación automatizada de perfiles públicos | PL/pgSQL |
| **Supabase Client SDK** | Conector oficial para consultas y persistencia de datos | `@supabase/supabase-js` |

---

# Instalación y Setup

Para ejecutar la aplicación en tu entorno de desarrollo local, asegúrate de contar con **Node.js** (v18 o superior) y **npm** (v10 o superior).

### 1. Clonar el repositorio
```bash
git clone <repo-url>
cd ControlBodegas
```

### 2. Configurar variables de entorno
Crea un archivo `.env` o `.env.development` dentro de la carpeta `stock-transfer-pmn/` con las credenciales de tu proyecto de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto-supabase.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-anon-key-publica
```

### 3. Instalar dependencias
```bash
cd stock-transfer-pmn
npm install
```

### 4. Inicializar base de datos (Supabase Editor SQL)
Si estás configurando un nuevo entorno de Supabase, ejecuta el script localizado en la raíz del repositorio [supabase_setup.sql](file:///c:/Users/alanp/Repositorios/ControlBodegas/supabase_setup.sql) en el editor SQL de Supabase para configurar el trigger automático que enlaza los usuarios de Auth con la tabla pública de `usuarios`.

### 5. Ejecutar la aplicación
```bash
npm run dev
```
El servidor levantará en `http://localhost:5173`.

### Scripts Disponibles
Ejecuta estos comandos en la carpeta `/stock-transfer-pmn`:
- `npm run dev`: Servidor de desarrollo con recarga en caliente (HMR).
- `npm run build`: Compilación de producción (archivos optimizados en `/dist`).
- `npm run lint`: Ejecución de análisis estático del código con ESLint.
- `npm run preview`: Vista previa local del build de producción generado.

---

# Arquitectura y Estructura del Proyecto

El código está estructurado bajo una **arquitectura modular por dominio** que separa claramente las responsabilidades del negocio:

```text
src/
│
├── app/
│   ├── routes/      # Rutas de la aplicación (React Router)
│   ├── layouts/     # Estructura visual principal (ej. MainLayout)
│   ├── providers/   # Proveedores generales
│   └── store/       # Proveedor central de datos y contexto (TransferContext)
│
├── modules/         # Módulos de negocio independientes (autocontenidos)
│   │
│   ├── dashboard/   # Dashboard de métricas, estadísticas e inicio de sesión
│   │
│   ├── transferencias/ # Flujos de creación, detalle y aprobación de transferencias
│   │   ├── pages/
│   │   ├── components/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── inventario/  # Consulta y ajustes de stock en bodegas en tiempo real
│   │
│   ├── auditoria/   # Panel de eventos y logs operacionales
│   │
│   └── autenticacion/# Autenticación de usuarios y perfiles
│
├── shared/          # Código común compartido entre múltiples módulos
│   ├── auth/        # Contexto de autenticación integrado con Supabase (AuthContext)
│   ├── components/  # Componentes transversales
│   ├── ui/          # Elementos básicos de UI (shadcn/ui, botones, diálogos)
│   ├── utils/       # Funciones auxiliares y cliente de Supabase (supabaseClient)
│   └── types/       # Tipos globales
│
├── assets/          # Imágenes y recursos estáticos
│
└── main.tsx         # Punto de entrada de React
```

---

## 🔄 Estructura Interna de Módulos

Cada módulo sigue un patrón autocontenido para mantener la modularidad y separación de responsabilidades:

```text
modulo/
├── pages/          # Componentes de página (vistas principales)
├── components/     # Componentes locales del módulo
├── hooks/          # Hooks personalizados del módulo
├── services/       # Servicios de API y comunicación
├── state/          # Gestión de estado local (Zustand, Context local)
├── types/          # Definiciones de tipo TypeScript para el dominio
├── utils/          # Funciones auxiliares del módulo
├── constants/      # Constantes exclusivas del módulo
├── mocks/          # Datos simulados para desarrollo/pruebas
├── schemas/        # Esquemas de validación de formularios/datos
├── index.ts        # Exportaciones públicas del módulo (punto de entrada)
└── README.md       # Documentación local del módulo
```

---

# Convenciones de Código y Estilo

- **Componentes React**: Nombre en PascalCase (ej: `DashboardPage.tsx`, `TransferDetail.tsx`).
- **Funciones y Variables**: Nombre en camelCase (ej: `formatDate.ts`, `obtenerTransferencias`).
- **Interfaces y Tipos**: Nombre en PascalCase (ej: `Transfer.ts`, `WarehouseType`).
- **Constantes**: Nombre en UPPER_SNAKE_CASE (ej: `TRANSFER_STATUS.ts`).
- **Importaciones type-only**: Usar la sintaxis `import type` para importar tipos de TypeScript (TS 5.0+), reduciendo el tamaño final del bundle compilado.

---

# Flujo Principal de Transferencias

El sistema sigue un flujo rígido de estados operacionales para garantizar la consistencia física del inventario:

```text
CREADA (Solicitud registrada por Supervisor)
   ↓
APROBADA (Aprobada por Supervisor de la bodega origen)
   ↓
RESERVADA (Operador de origen bloquea el stock disponible en inventario)
   ↓
EN_TRANSITO (Operador registra el despacho y asigna transportista)
   ↓
RECIBIDA / CON_DIFERENCIA (Operador de destino registra la cantidad recibida)
   ↓
CERRADA (Cierre formal de la transferencia)
```

---

# Estados del Sistema

El flujo completo de estados mapeado en base de datos es:
- `CREADA`: Solicitud inicial creada.
- `APROBADA`: Aprobación técnica del supervisor origen.
- `RESERVADA`: Stock bloqueado físicamente en origen.
- `EN_TRANSITO`: Carga despachada de bodega origen.
- `RECIBIDA_SIN_DIFERENCIA` o `CON_DIFERENCIA`: Recepción en destino, con o sin inconsistencias.
- `RECHAZADA`: Solicitud denegada por supervisor.
- `ERROR_RESERVA`: Fallo al intentar reservar (ej. por falta de stock repentino).
- `CERRADA`: Operación finalizada.

---

# Concurrencia y Consistencia de Stock

El PMV implementa lógica transaccional para evitar inconsistencias de inventario en operaciones concurrentes:
1. **Validación de Disponibilidad**: Antes de reservar stock, se realiza una consulta directa a la base de datos de Supabase.
2. **Reserva Atómica**: Al ejecutar `reserveTransfer`, se reduce de forma inmediata el campo `stock_disponible` y se incrementa el campo `stock_reservado` en la tabla `inventario` en una única transacción de actualización.
3. **Manejo de Errores de Reserva**: Si el stock disponible en la base de datos es menor a la cantidad solicitada (debido a otra transacción concurrente), la operación falla con una excepción y la transferencia cambia automáticamente a `ERROR_RESERVA`.
4. **Descuento Físico**: Al recibir la mercadería en destino, se elimina el stock reservado de la bodega origen y se agrega el stock real disponible a la bodega destino.

---

# Integración con Backend (Supabase)

El sistema se conecta a una base de datos PostgreSQL estructurada en Supabase:
- **`usuarios`**: Contiene la información de nombre, email, rol corporativo y bodega asignada. Vinculado por `auth_user_id` a la tabla de autenticación.
- **`bodegas`**: Listado de centros de distribución de la empresa.
- **`productos`**: Catálogo maestro de productos con códigos SKU.
- **`inventario`**: Tabla puente de stock por bodega (`bodega_id`, `producto_id`, `stock_disponible`, `stock_reservado`).
- **`transferencias`**: Contiene el estado, cantidad, origen, destino, transportista y solicitante de cada transferencia.
- **`eventos_auditoria`**: Log persistente de eventos del sistema para trazabilidad.

---

# Estado de Implementación del Proyecto

El PMV ha completado la totalidad de sus módulos centrales planificados:

- [x] **Autenticación Real**: Login persistente por Supabase Auth, cierre de sesión y redirección basada en roles de usuario (`administrador`, `supervisor_bodega`, `operador_bodega`, `transportista`).
- [x] **Dashboard de Operaciones**: Métricas dinámicas, totalizadores de transferencias y accesos directos operacionales filtrados por el contexto de bodega del usuario.
- [x] **Gestión de Transferencias**: Creación, validación interactiva de stock de origen, aprobación por parte del supervisor del centro emisor.
- [x] **Gestión de Inventario**: Vistas detalladas del stock de cada producto en la bodega activa, permitiendo ajustes manuales autorizados (con auditoría persistente obligatoria).
- [x] **Auditoría Centralizada**: Visualización y filtros detallados de la tabla `eventos_auditoria`.
- [x] **Lógica de Reserva, Despacho y Recepción**: Flujo transaccional completo con actualización de stocks físicos en origen y destino, cálculo automático de diferencias y asignación de transportistas en tiempo real.

---

# Contribución al Proyecto

1. Crear una rama para la característica (`git checkout -b feature/nueva-caracteristica`).
2. Realizar commits atómicos y claros (`git commit -m 'Implementar nueva validación'`).
3. Hacer push de la rama a tu repositorio (`git push origin feature/nueva-caracteristica`).
4. Abrir un Pull Request (PR) detallando los cambios introducidos.