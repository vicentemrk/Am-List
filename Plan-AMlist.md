# Plan Maestro — AMlist (MVP) — v2
### Gestor de listas de anime/manga con Jikan API

Documento generado por el **Equipo de Desarrollo Senior** (Team Brain, Task Distributor, Programmer, Manager). Esta versión añade: arquitectura limpia adaptada a React, consumo con Fetch nativo, y trazabilidad de los 4 criterios de evaluación hacia un `README-CRITERIOS.md`.

---

## 0. Resumen del proyecto

| Campo | Valor |
|---|---|
| Nombre provisional | **AMlist** |
| Tipo | SPA (Single Page Application) |
| Stack | React (Vite), CSS con variables (light/dark theme) |
| API | Jikan API v4 (pública, sin auth) — consumida con **Fetch nativo** |
| Persistencia | 100% cliente — `localStorage` (sin backend), con CRUD e integridad validada |
| Enfoque | Mobile First, animaciones, favicon propio, Clean Architecture adaptada |
| Entregable adicional | `README-CRITERIOS.md` — mapea cada criterio de evaluación a su implementación exacta |

---

## 1. TEAM BRAIN — Arquitectura y decisiones estratégicas

### 1.1 Stack técnico
- **React 18 + Vite**.
- Navegación por estado (`activeView`) — sin router externo en el MVP.
- **CSS con variables** (`:root` + `[data-theme='dark']`) para el theming.
- **Fetch nativo** para consumir Jikan API (sin Axios) — se envuelve en un cliente propio para centralizar manejo de errores, timeouts y cancelación.

### 1.2 Arquitectura limpia adaptada a React (basada en los principios de Clean Architecture)

Aunque Clean Architecture nace en mundo Android/Kotlin, sus reglas de dependencia se trasladan directo a una SPA de React: **el dominio no depende de nada externo**, la UI no accede directo a `localStorage` ni a `fetch`, todo pasa por capas con responsabilidad única.

```
src/
  domain/                    # Lógica pura, sin React ni APIs del navegador
    models/
      Item.js                 # Forma canónica del ítem (anime/manga)
      Estado.js                # Enum de estados de usuario
    usecases/
      validarProgreso.js       # Regla: progreso <= máximo
      filtrarPorSeccion.js     # Regla: qué ítems entran en cada una de las 8 secciones
      construirEntradaHistorial.js

  data/                       # Implementaciones concretas (acceso a mundo externo)
    api/
      jikanClient.js          # fetch nativo + AbortController + reintentos + mapeo de errores
      jikanMapper.js          # DTO de Jikan -> Item (domain)
    storage/
      itemsRepository.js       # CRUD sobre localStorage (create/read/update/delete) + validación de integridad
      historyRepository.js     # CRUD del log de historial
      themeRepository.js       # persistencia del tema claro/oscuro

  presentation/                # React puro: componentes, hooks, estado de UI
    components/
      SearchAddModal.jsx
      ItemCard.jsx
      EditModal.jsx
      NavBar.jsx
      HistoryView.jsx
    hooks/
      useDebounce.js
      useTheme.js
      useItems.js               # conecta usecases + repository con el estado de React

  App.jsx
  main.jsx
  styles/
    tokens.css
    global.css
```

**Regla de dependencia (idéntica en espíritu a Android Clean Architecture):**

```
presentation → domain, data
data         → domain
domain       → (nada; JS puro, cero imports de React ni de window/fetch/localStorage)
```

- `domain` es 100% testeable sin DOM ni mocks de red: son funciones puras que reciben datos y devuelven datos.
- `data/storage/itemsRepository.js` es el **único** lugar del proyecto que llama a `localStorage.getItem/setItem`. Ningún componente accede a `localStorage` directamente.
- `data/api/jikanClient.js` es el **único** lugar que llama a `fetch`. Ningún componente hace `fetch` directamente.
- Los componentes de `presentation` solo consumen hooks (`useItems`, etc.), nunca repositorios ni el cliente de API directamente.

Esto resuelve de forma natural los criterios 3 y 4 (CRUD con integridad, consumo de API con manejo de errores) porque quedan aislados en capas concretas y auditables.

### 1.3 Modelo de datos (domain/models/Item.js)

```js
/**
 * @typedef {Object} Item
 * @property {string} id            - `${media}_${malId}`, único
 * @property {number} malId         - ID de MyAnimeList (Jikan)
 * @property {'anime'|'manga'} media
 * @property {string} titulo
 * @property {string} imagen
 * @property {string} tipo          - TV/OVA/ONA/OAV/Movie/Special (anime) | Manga/Manhwa/Manhua/One-shot (manga)
 * @property {'por_ver'|'en_curso'|'completado'|'dropeado'} estado
 * @property {'en_emision'|'finalizado'} estadoEmision
 * @property {number|null} puntuacion   - 1-10, opcional
 * @property {boolean} favorito         - estrella, independiente de puntuacion
 * @property {{actual:number, maximo:number|null, unidad:'episodio'|'capitulo'}} progreso
 * @property {string} tag
 * @property {string} fechaAgregado     - ISO 8601
 * @property {string} fechaActualizado  - ISO 8601
 */
```

### 1.4 Las 8 secciones (usecase `filtrarPorSeccion`)

| Sección | Filtro |
|---|---|
| Lista completa | todos |
| Completados | `estado === 'completado'` |
| Por ver / Por mirar | `estado === 'por_ver'` |
| Favoritos | `favorito === true` |
| En curso / Mirando | `estado === 'en_curso'` |
| En emisión | `estadoEmision === 'en_emision'` |
| Finalizados | `estadoEmision === 'finalizado'` |
| Dropeados / Abandonados | `estado === 'dropeado'` |

### 1.5 Consumo de Jikan con Fetch nativo (`data/api/jikanClient.js`)

Requisitos de implementación (cubre el criterio 4 explícitamente):
- `fetch` envuelto en una función `jikanFetch(path, { signal })` con:
  - Timeout manual vía `AbortController` (12s) además del `signal` externo para cancelar búsquedas obsoletas (debounce).
  - Manejo de códigos HTTP: `429` (rate limit de Jikan) → mensaje "Demasiadas solicitudes, espera unos segundos"; `404` → "No encontrado"; `5xx` → "Jikan no responde, intenta más tarde"; error de red (`TypeError` de fetch) → "Sin conexión a internet".
  - Validación de la forma de la respuesta antes de mapear (evitar `undefined.map`, chequeo de `Array.isArray(data.data)`).
  - Un tipo de error propio `JikanApiError { tipo, mensaje, status }` que la UI consume para mostrar toasts/alerts, nunca el error crudo de `fetch`.
- Endpoints usados: `GET /anime?q=`, `GET /manga?q=`, `GET /anime/{id}`, `GET /manga/{id}` (para refrescar el máximo de episodios/capítulos).
- Rate limit ~3 req/seg → debounce de 500ms + cancelación de la solicitud anterior con `AbortController` al tipear.

### 1.6 CRUD sobre localStorage con integridad (`data/storage/itemsRepository.js`)

Cubre el criterio 3 explícitamente:

```js
// Firma del repositorio — único punto de acceso a localStorage para items
export const itemsRepository = {
  getAll(),               // READ  - lee y valida el array completo
  getById(id),             // READ
  create(item),             // CREATE - valida contra el esquema antes de guardar
  update(id, cambios),      // UPDATE - valida progreso <= máximo antes de persistir
  remove(id),               // DELETE
};
```

Reglas de integridad obligatorias:
1. **Validación de esquema** antes de cualquier escritura: `id`, `malId`, `media`, `titulo` no pueden ser `undefined`/vacíos; `puntuacion` debe estar en `[1,10]` o `null`; `progreso.actual` debe ser un entero `>= 0`.
2. **Validación cruzada de progreso**: `update()` rechaza el cambio si `progreso.actual > progreso.maximo` (cuando `maximo` no es `null`), devolviendo `{ ok:false, error:'PROGRESO_EXCEDE_MAXIMO' }` — la UI traduce esto al mensaje de advertencia pedido por el usuario.
3. **Manejo de corrupción**: si `JSON.parse` de `localStorage` falla (dato corrupto), el repositorio no debe tirar la app entera — recupera con un array vacío y loguea el problema, mostrando un aviso no bloqueante.
4. **Atomicidad simulada**: cada `create`/`update`/`delete` lee el array completo, aplica el cambio en memoria, valida, y recién ahí escribe de vuelta — nunca se hacen escrituras parciales.
5. Los IDs son deterministas (`${media}_${malId}`) para evitar duplicados accidentales al re-agregar el mismo anime/manga.

### 1.7 Theming (tokens ya definidos por el usuario)

```css
:root {
  --bg: #F0F6F6;
  --surface: #FFFFFF;
  --text-primary: #162425;
  --text-muted: #6D8788;
  --accent-visto: #10B99B;
  --accent-completado: #9333EA;
  --border: #DCE7E7;
}

[data-theme='dark'] {
  --bg: #162425;
  --surface: #213334;
  --text-primary: #E2F0F0;
  --text-muted: #8AA4A5;
  --accent-visto: #2BEBC8;
  --accent-completado: #B966FF;
  --border: #30484A;
}
```
- `--accent-visto` → en curso / progreso activo.
- `--accent-completado` → completado y elementos favoritos/destacados.
- Colores faltantes (dropeado, advertencia de validación, estrella de favorito) se derivan tonalmente por el Programmer y se documentan en el mismo archivo `tokens.css` antes de usarse en componentes.

### 1.8 Mobile First
- Base ~375px; tab bar inferior fija en mobile; sidebar/topbar en desktop.
- Modal de edición: bottom sheet en mobile, modal centrado en desktop.
- Grid de tarjetas escalable (1→2→3→4→6 columnas según breakpoint).

---

## 2. TASK DISTRIBUTOR — Desglose de tareas

| # | Tarea | Estimación | Depende de |
|---|---|---|---|
| 1 | Setup Vite + React, estructura `domain/data/presentation`, tokens CSS light/dark | 1h | — |
| 2 | Favicon + metadatos | 0.5h | 1 |
| 3 | `domain/models`, `domain/usecases` (validarProgreso, filtrarPorSeccion, construirEntradaHistorial) — funciones puras | 1.5h | 1 |
| 4 | `data/storage/itemsRepository.js` — CRUD + validación de integridad | 2h | 3 |
| 5 | `data/storage/historyRepository.js` y `themeRepository.js` | 1h | 4 |
| 6 | `data/api/jikanClient.js` + `jikanMapper.js` — Fetch nativo, AbortController, manejo de errores | 2.5h | 1 |
| 7 | `presentation/hooks/useItems.js`, `useDebounce.js`, `useTheme.js` — conectan domain+data con React | 1.5h | 4, 6 |
| 8 | `SearchAddModal` (buscar en Jikan → imagen+título+botón agregar) | 2h | 6, 7 |
| 9 | `ItemCard` + `EditModal` (estado, progreso con bloqueo de máximo, tag, puntuación, favorito) | 2.5h | 7 |
| 10 | Navegación 8 secciones + filtro Lista Animes / Lista Mangas | 2h | 9 |
| 11 | Exportar a JSON | 0.5h | 4 |
| 12 | Vista de Historial | 1.5h | 5 |
| 13 | Animaciones + toggle tema | 2h | 9, 10 |
| 14 | Responsive / Mobile First | 2h | 9, 10 |
| 15 | `README-CRITERIOS.md` — mapear los 4 criterios a archivos/líneas concretas | 1h | Todas |
| 16 | QA final contra criterios de aceptación | 1.5h | Todas |

**Total estimado: ~24h**

---

## 3. PROGRAMMER — Lineamientos de implementación

### 3.1 Validación de progreso (regla crítica, vive en `domain/usecases/validarProgreso.js`)
```js
export function validarProgreso({ actual, maximo, unidad }) {
  if (maximo != null && actual > maximo) {
    return {
      valido: false,
      codigo: 'PROGRESO_EXCEDE_MAXIMO',
      mensaje: `No puedes ingresar el ${unidad} ${actual}: esta serie solo tiene ${maximo}.`,
    };
  }
  if (!Number.isInteger(actual) || actual < 0) {
    return { valido: false, codigo: 'PROGRESO_INVALIDO', mensaje: 'El progreso debe ser un número entero positivo.' };
  }
  return { valido: true };
}
```
- `EditModal` llama a `validarProgreso` en cada cambio; el botón "Guardar" se deshabilita mientras `valido === false` y se muestra `mensaje` en rojo.
- El repositorio (`itemsRepository.update`) vuelve a correr la misma validación como segunda barrera — nunca confiar solo en la UI.

### 3.2 Historial
- Cada mutación relevante genera una entrada vía `construirEntradaHistorial(accion, item, detalle)`:
```json
{ "fecha": "2026-07-11T10:00:00Z", "accion": "cambio_estado", "titulo": "One Piece", "detalle": "en_curso → completado" }
```
- Persistida por `historyRepository`, orden cronológico descendente en la vista.

### 3.3 Exportar JSON
- Botón descarga `amlist_export_{fecha}.json` con el array de `itemsRepository.getAll()`.

### 3.4 Buenas prácticas React exigidas (criterio 2)
- Componentes funcionales + hooks, sin clases.
- Un componente = una responsabilidad; lógica de negocio nunca dentro de un `.jsx` (vive en `domain`/`hooks`).
- `key` estable (`item.id`) en listas, nunca el índice.
- Memoización (`useMemo`/`useCallback`) solo donde el perfil de rendimiento lo justifique — no memoización especulativa.
- Nombres de props y estado en español, consistentes con el dominio del proyecto (`estado`, `progreso`, `favorito`).
- Accesibilidad básica: `alt` en imágenes, `aria-label` en botones de solo ícono, foco visible en modales.

---

## 4. MANAGER — Criterios de aceptación (QA)

1. ✅ Las 8 secciones filtran correctamente según su eje (favoritos cruza cualquier estado).
2. ✅ Buscar en Jikan muestra imagen + título + botón "Agregar" antes de confirmar la adición.
3. ✅ Progreso mayor al máximo de la API **bloquea el guardado** (validado en UI y en el repositorio).
4. ✅ Puntuación 1–10 y favorito son controles independientes.
5. ✅ Exportar a JSON descarga un archivo válido y completo.
6. ✅ Historial refleja cronológicamente altas y cambios.
7. ✅ Redirección a Lista de Animes / Lista de Mangas filtra por `media` correctamente.
8. ✅ Tema claro/oscuro respeta los tokens exactos y persiste tras recargar.
9. ✅ Usable en 360px sin scroll horizontal.
10. ✅ Favicon visible en pestaña y al agregar a inicio en mobile.
11. ✅ Datos persisten tras cerrar/reabrir el navegador.
12. ✅ Ningún componente de `presentation` accede a `fetch` o `localStorage` directamente (verificable por grep).
13. ✅ Errores de red/rate-limit de Jikan se traducen a mensajes legibles, sin romper la UI ni dejar promesas sin capturar.
14. ✅ `README-CRITERIOS.md` existe y mapea correctamente los 4 criterios a archivos concretos.

---

## 5. Trazabilidad de los 4 criterios de evaluación

| # | Criterio | Dónde se cumple |
|---|---|---|
| 1 | Identifica elementos de frameworks JS (React) con IA | `README-CRITERIOS.md` documenta, componente por componente, qué elementos de React se usan (JSX, componentes funcionales, props, estado con `useState`, efectos con `useEffect`, hooks personalizados, listas con `key`, renderizado condicional) y por qué se eligió cada uno. |
| 2 | Codifica componentes React con buenas prácticas y recomendaciones IA | Ver §3.4. `README-CRITERIOS.md` enlaza cada buena práctica a el/los componente(s) donde se aplica. |
| 3 | Implementa CRUD con LocalStorage, validando integridad | `data/storage/itemsRepository.js` (§1.6). `README-CRITERIOS.md` lista las 4 operaciones CRUD y las 5 reglas de integridad, con referencia a línea/función. |
| 4 | Consume APIs con Fetch/Axios, manejo de errores y validaciones IA | `data/api/jikanClient.js` (§1.5), usando **Fetch nativo**. `README-CRITERIOS.md` detalla los casos de error cubiertos (429, 404, 5xx, sin conexión, respuesta malformada). |

`README-CRITERIOS.md` se genera como parte de la Tarea 15 y es un entregable tan obligatorio como el código.

---

## 6. PROMPT MAESTRO AUTOCONTENIDO

*(Copiar y pegar este bloque completo a cualquier desarrollador o IA para construir AMlist desde cero)*

```
Actúa como un desarrollador senior de React con 10+ años de experiencia y aplica Clean Architecture adaptada a una SPA de JavaScript. Construye AMlist, una app para gestionar listas personales de anime y manga con Jikan API v4 pública y persistencia 100% en localStorage, sin backend.

MUST HAVE:
- domain/ con funciones puras y sin imports de React, fetch o localStorage: validarProgreso, filtrarPorSeccion y construirEntradaHistorial.
- data/ con un único punto para fetch en jikanClient.js y un único punto para localStorage en itemsRepository.js, historyRepository.js y themeRepository.js.
- presentation/ con componentes y hooks de React que consumen domain y data solo a través de hooks como useItems, useTheme y useDebounce.
- 8 secciones: Lista completa, Completados, Por ver/Por mirar, Favoritos, En curso/Mirando, En emisión, Finalizados y Dropeados/Abandonados.
- Cada ítem debe guardar id, imagen, título, tipo, puntuación opcional de 1 a 10, favorito independiente, estado, estado de emisión, progreso validado contra el máximo y tag libre.
- Si progreso.actual supera progreso.maximo, el guardado se bloquea en UI y repositorio.
- Búsqueda en Jikan con debounce de 500ms, AbortController, preview con imagen + título + botón Agregar.
- Exportar a JSON, ver Historial, navegación por Lista de Animes y Lista de Mangas, mobile first, animaciones sutiles y favicon propio.
- Theme con estas variables exactas y persistencia en localStorage:

:root {
  --bg: #F0F6F6; --surface: #FFFFFF; --text-primary: #162425; --text-muted: #6D8788;
  --accent-visto: #10B99B; --accent-completado: #9333EA; --border: #DCE7E7;
}
[data-theme='dark'] {
  --bg: #162425; --surface: #213334; --text-primary: #E2F0F0; --text-muted: #8AA4A5;
  --accent-visto: #2BEBC8; --accent-completado: #B966FF; --border: #30484A;
}

API RULES:
- Usa Fetch nativo, no Axios.
- jikanClient.js debe manejar timeout de 12s, cancelación de búsquedas obsoletas, 429, 404, 5xx, errores de red y respuesta malformada con un error tipado JikanApiError.
- Mantén Jikan como fuente principal, pero deja lista una capa intercambiable para sumar APIs gratuitas sin reescribir la UI.
- Si hace falta una alternativa gratuita, considera AniList GraphQL o Kitsu API.
- Cachea búsquedas recientes en memoria y, de forma breve, en localStorage.
- Normaliza todas las respuestas al mismo contrato de dominio y muestra reintento manual ante fallos.

REACT Y CRUD:
- Solo componentes funcionales y hooks.
- No pongas lógica de negocio dentro de JSX.
- Usa key estable por item.id y accesibilidad básica con alt, aria-label y foco visible.
- itemsRepository debe implementar create, getAll, getById, update y remove, validar esquema antes de escribir, rechazar progreso inválido, recuperar sin romper la app si hay JSON corrupto y usar IDs deterministas `${media}_${malId}`.

OUTPUT:
- Genera también README-CRITERIOS.md mapeando los 4 criterios de evaluación a archivos y funciones concretas.
- Antes de codificar, entrega una lista priorizada de riesgos.
- No asumas router ni backend salvo que el plan lo autorice.
- Documenta cualquier decisión nueva en README-CRITERIOS.md o notas técnicas.
- Si una mejora requiere pago o autenticación, descártala y busca una alternativa gratuita.

QA:
- Deben funcionar las 8 secciones, la preview de Jikan, el bloqueo de progreso, la independencia entre favorito y puntuación, export JSON, historial cronológico, filtros por media, theme persistente, uso en 360px, favicon, persistencia al recargar, ausencia de fetch/localStorage en presentation, manejo legible de errores de Jikan y el README-CRITERIOS.md.

Entrega el código completo, funcional y comentado solo donde haga falta.
```

---

## 7. Preguntas abiertas para próxima iteración

- ¿La estrella de favorito y el color de "dropeado" los defines tú, o los propongo yo dentro del mismo esquema tonal antes de codear?
- ¿El historial debe registrar también eliminaciones de ítems, o solo altas/cambios de estado/progreso?
- ¿El export JSON debe incluir el historial, o solo la lista de ítems?

---

## 8. Mejoras propuestas al plan

### 8.1 Mejoras de requisitos
- Agregar un sistema de filtros combinables, por ejemplo `media + estado + favorito + puntuación`, para que la navegación sea más útil sin duplicar vistas.
- Incluir búsqueda local por texto sobre la lista guardada, no solo sobre Jikan, para encontrar más rápido items ya agregados.
- Permitir ordenamiento por fecha de agregado, título, puntuación y progreso, con persistencia de la preferencia del usuario.
- Definir un estado extra de `pendiente_de_revision` para ítems importados o con datos incompletos, si más adelante se amplía el modelo.
- Añadir confirmación antes de eliminar y opción de deshacer la última acción, para reducir errores en mobile.
- Considerar importación JSON además de exportación, para que el usuario pueda migrar sus datos entre dispositivos.
- Incorporar contador de estadística rápida por vista: total, completados, en curso, favoritos y progreso medio.

### 8.2 Mejoras del theme
- Definir un tercer estado visual de `high-contrast` para accesibilidad, manteniendo los tokens base pero con mayor separación entre fondo, texto y bordes.
- Añadir tokens derivados para `warning`, `danger`, `success`, `shadow`, `overlay` y `favorite`, documentados dentro de `tokens.css` antes de usarlos en componentes.
- Hacer que el toggle de tema recuerde también el modo del sistema, con una opción explícita de `seguir sistema`.
- Usar gradientes suaves y una textura de fondo sutil para que la app no se vea plana, sin romper la legibilidad.
- Reservar una variación de color para la vista de historial y otra para listas activas, de forma que cada zona tenga identidad propia.
- Verificar contraste WCAG mínimo en texto y botones principales, especialmente en mobile y en el modo oscuro.
