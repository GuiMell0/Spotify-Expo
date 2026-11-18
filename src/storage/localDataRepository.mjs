import { decodeLocalData, encodeLocalData, localDataKey } from './localDataSchema.mjs';
import { LocalDataError, localDataError } from './localDataErrors.mjs';

export function createAsyncStorageDriver(loadStorage) {
  let loaded = null;
  function load() {
    if (!loaded) loaded = Promise.resolve().then(loadStorage).catch(() => { loaded = null; throw new LocalDataError('unavailable'); });
    return loaded;
  }
  return {
    getItem: async key => (await load()).getItem(key),
    setItem: async (key, value) => (await load()).setItem(key, value),
  };
}

export function createLocalDataRepository(storage, { timeoutMs = 5000 } = {}) {
  const lanes = new Map();
  async function read(key, accountId, check) {
    let raw;
    try { raw = await storage.getItem(key); } catch (error) { throw localDataError(error, 'read'); }
    check();
    if (raw !== null && typeof raw !== 'string') throw new LocalDataError('invalid_data');
    return decodeLocalData(raw, accountId);
  }
  function run(accountId, operation, { isActive = () => true } = {}) {
    let key;
    try { key = localDataKey(accountId); } catch (error) { return Promise.reject(error); }
    let expired = false, timer;
    const check = () => { if (expired || !isActive()) throw new LocalDataError('cancelled'); };
    const pending = (lanes.get(key) ?? Promise.resolve()).then(() => { check(); return operation(key, check); });
    const settled = pending.catch(() => {});
    lanes.set(key, settled);
    settled.then(() => { if (lanes.get(key) === settled) lanes.delete(key); });
    return Promise.race([pending, new Promise((_, reject) => {
      timer = setTimeout(() => { expired = true; reject(new LocalDataError('timeout')); }, timeoutMs);
    })]).finally(() => clearTimeout(timer));
  }
  return {
    load: (accountId, options) => run(accountId, (key, check) => read(key, accountId, check), options),
    update: (accountId, update, options) => run(accountId, async (key, check) => {
      const previous = await read(key, accountId, check);
      if (typeof update !== 'function') throw new LocalDataError('invalid_data');
      let next;
      try { next = update(previous); } catch (error) { throw localDataError(error, 'invalid_data'); }
      if (next?.then) { Promise.resolve(next).catch(() => {}); throw new LocalDataError('invalid_data'); }
      const raw = encodeLocalData(next, accountId);
      check();
      if (raw === encodeLocalData(previous, accountId)) return previous;
      try { await storage.setItem(key, raw); } catch (error) { throw localDataError(error, 'write'); }
      check();
      return decodeLocalData(raw, accountId);
    }, options),
  };
}
