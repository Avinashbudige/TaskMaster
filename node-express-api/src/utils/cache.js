const store = new Map();

function set(key, value, ttlMs) {
  const expiresAt = Date.now() + ttlMs;
  store.set(key, { value, expiresAt });
}

function get(key) {
  const entry = store.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }

  return entry.value;
}

function clearByPrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

module.exports = {
  set,
  get,
  clearByPrefix,
};
