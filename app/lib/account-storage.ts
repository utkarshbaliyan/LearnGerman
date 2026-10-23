import { CLOUD_PROGRESS_OWNER_STORAGE_KEY, PROGRESS_STORAGE_KEYS } from './cloud-progress-keys';
import { VOCABULARY_LEGACY_STORAGE_KEYS } from './progress-sync';

export function accountWasDeleted(storage: Pick<Storage, 'getItem'>, owner: string) {
  return storage.getItem(`leselaut:deleted-account:${owner}`) === '1';
}

export function clearAccountStorage(storage: Storage, owner: string) {
  storage.setItem(`leselaut:deleted-account:${owner}`, '1');
  const keys = [...Object.values(PROGRESS_STORAGE_KEYS), ...VOCABULARY_LEGACY_STORAGE_KEYS, CLOUD_PROGRESS_OWNER_STORAGE_KEY];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key?.startsWith(`leselaut-draft:${owner}:`)) keys.push(key);
  }
  for (const key of keys) storage.removeItem(key);
}
