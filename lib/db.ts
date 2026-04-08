import type { HistoryItem } from './types'

const DB_NAME    = 'zeiss-studio'
const DB_VERSION = 1
const STORE      = 'history'

// 打开（或初始化）IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

// 新增或覆盖一条记录
export async function dbSave(item: HistoryItem): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(item)
    req.onsuccess = () => resolve()
    req.onerror   = () => reject(req.error)
  })
}

// 加载全部历史（按 id 降序，即最新在前）
export async function dbLoadAll(): Promise<HistoryItem[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll()
    req.onsuccess = () => resolve((req.result as HistoryItem[]).reverse())
    req.onerror   = () => reject(req.error)
  })
}

// 删除单条记录
export async function dbDelete(id: number): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id)
    req.onsuccess = () => resolve()
    req.onerror   = () => reject(req.error)
  })
}

// 清空所有记录
export async function dbClear(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).clear()
    req.onsuccess = () => resolve()
    req.onerror   = () => reject(req.error)
  })
}
