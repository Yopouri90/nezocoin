// NezoCoin — Database (Firebase Realtime DB with localStorage fallback)

let db = null;
let firebaseReady = false;

function initFirebase() {
  try {
    if (NEZO.FIREBASE.apiKey === 'REMPLACE_MOI') {
      console.warn('[NZ] Firebase not configured — using localStorage fallback');
      return false;
    }
    firebase.initializeApp(NEZO.FIREBASE);
    db = firebase.database();
    firebaseReady = true;
    console.log('[NZ] Firebase connected');
    return true;
  } catch (e) {
    console.warn('[NZ] Firebase init failed — using localStorage fallback', e);
    return false;
  }
}

// --- Generic read/write ---

async function dbGet(path) {
  if (firebaseReady) {
    const snap = await db.ref(path).get();
    return snap.exists() ? snap.val() : null;
  }
  const raw = localStorage.getItem('nz_' + path.replace(/\//g, '_'));
  return raw ? JSON.parse(raw) : null;
}

async function dbSet(path, value) {
  if (firebaseReady) {
    await db.ref(path).set(value);
  } else {
    localStorage.setItem('nz_' + path.replace(/\//g, '_'), JSON.stringify(value));
  }
}

async function dbUpdate(path, updates) {
  if (firebaseReady) {
    await db.ref(path).update(updates);
  } else {
    const existing = await dbGet(path) || {};
    await dbSet(path, { ...existing, ...updates });
  }
}

function dbOnValue(path, callback) {
  if (firebaseReady) {
    db.ref(path).on('value', snap => callback(snap.val()));
  } else {
    // Poll localStorage every 2s
    const poll = () => {
      const raw = localStorage.getItem('nz_' + path.replace(/\//g, '_'));
      callback(raw ? JSON.parse(raw) : null);
    };
    poll();
    setInterval(poll, 2000);
  }
}

async function dbPush(path, value) {
  if (firebaseReady) {
    const ref = db.ref(path).push();
    await ref.set(value);
    return ref.key;
  } else {
    const existing = await dbGet(path) || [];
    if (Array.isArray(existing)) {
      existing.push(value);
      if (existing.length > 100) existing.splice(0, existing.length - 100);
      await dbSet(path, existing);
    }
    return Date.now().toString();
  }
}

async function dbTransaction(path, fn) {
  if (firebaseReady) {
    await db.ref(path).transaction(fn);
  } else {
    const current = await dbGet(path);
    const next = fn(current);
    if (next !== undefined) await dbSet(path, next);
  }
}