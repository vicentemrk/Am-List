/**
 * ============================================================================
 * PUERTO DE DOMINIO: domain/ports/ItemsRepositoryPort.js
 * ============================================================================
 * Qué hace:
 *   Define la interfaz (contrato abstracto) que debe cumplir cualquier repositorio
 *   de ítems (animes y mangas), ya sea que guarde datos en `localStorage`, en un
 *   servidor `API REST`, en `Supabase` o en una base de datos `PostgreSQL`.
 * 
 * Cómo funciona (Arquitectura Hexagonal):
 *   Este puerto vive en la Capa de Dominio. No contiene código de implementación
 *   ni dependencias de navegador o servidor. Especifica la firma JSDoc, los
 *   parámetros esperados y el valor de retorno de cada operación CRUD.
 *   Los adaptadores concretos (`itemsLocalStorageAdapter`, `itemsRemoteAdapter`)
 *   son los encargados de realizar el trabajo real respetando este contrato.
 * ============================================================================
 */

/**
 * @typedef {import('../itemSchema.js').DEFAULT_ITEM} Item
 */

/**
 * Interfaz del Puerto de Repositorio de Ítems (Definición conceptual de contrato JSDoc).
 * 
 * @typedef {Object} IItemsRepositoryPort
 * 
 * @property {() => Promise<Item[]> | Item[]} getAll
 *   Obtiene todos los animes y mangas registrados.
 * 
 * @property {(id: string) => Promise<Item|null> | Item|null} getById
 *   Busca un ítem específico por su identificador único (ej: "anime_123").
 * 
 * @property {(itemData: Partial<Item>) => Promise<Item> | Item} create
 *   Crea y persiste un nuevo ítem asegurando que no existan duplicados.
 * 
 * @property {(id: string, patch: Partial<Item>) => Promise<Item> | Item} update
 *   Actualiza las propiedades de un ítem existente (progreso, notas, estado).
 * 
 * @property {(id: string) => Promise<void> | void} remove
 *   Elimina un ítem de la colección permanente por su ID.
 * 
 * @property {(importedItems: Partial<Item>[]) => Promise<number> | number} importBatch
 *   Importa un conjunto de ítems en lote combinando los existentes y agregando los nuevos.
 */

// Exportación simbólica para mantener el contrato identificable en el dominio
export const ItemsRepositoryPort = {};
