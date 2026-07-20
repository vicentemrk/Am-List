# Plan de Refactorización — Arquitectura Hexagonal (Pausado para continuar luego)

Se busca refactorizar la base de código actual para implementar una verdadera Arquitectura Hexagonal (Ports & Adapters). Esto desacoplará completamente la interfaz de usuario (React) de la capa de persistencia (LocalStorage) y de las APIs externas, preparando el terreno para migrar a una base de datos gratuita (como Supabase).

## 1. Documentación Estratégica (Nuevos Archivos Pendientes)

- **Crear `20_ideas_implementacion.md`**: Un documento con un ranking de 20 ideas de mejora que mezclarán UX/UI (ej. PWA, dashboard), características de negocio (ej. listas compartidas) y arquitectura interna (ej. testing). Estarán rankeadas por prioridad/valor.
- **Crear `business_logic.txt`**: Un archivo de texto redactado en palabras simples y humanas, explicando toda la lógica de negocio (validaciones de progreso, estados de emisión, etc.) y qué hace cada archivo importante. **Este archivo deberá agregarse a `.gitignore`**.

## 2. Reestructuración de Carpetas (Hexagonal)

Migrar el código a las siguientes capas en inglés:

- `src/domain/`: Entidades (ItemSchema) y Servicios (Validadores).
- `src/application/usecases/`: Casos de uso independientes de React.
- `src/infrastructure/`: Adaptadores concretos (`LocalStorageItemsRepository`, clientes de API) y la inyección de dependencias (`DependencyContext`).
- `src/presentation/`: React puro (Componentes y Hooks).

- **Nuevo Contexto:** Crear `src/infrastructure/di/DependencyContext.jsx` para inyectar los adaptadores.
- **Modificar Hooks:** Modificar `src/presentation/hooks/useItems.js` para que consuma los Casos de Uso en vez de los archivos de `data/`.
- **Limpieza:** Eliminar la carpeta `src/data/` (moviendo su contenido a `infrastructure`).

## 3. Limpieza de Lógica de UI (EditModal)

Modificar `src/presentation/components/EditModal/EditModal.jsx` para delegar la validación a los Casos de Uso, limitándose a mostrar la UI.

## 4. Actualización del Plan Maestro

Modificar `Plan-AmList.md`:
- Marcar como completadas las tareas del MVP.
- Documentar la nueva arquitectura hexagonal.

---
**NOTA PARA EL FUTURO:** 
Al retomar este proyecto, recuerda cerrar la pestaña `AmList\src\index.css` que tienes abierta en VS Code, ya que corresponde a la carpeta antigua duplicada que eliminamos. Abre el archivo `src/index.css` de la raíz del proyecto.
