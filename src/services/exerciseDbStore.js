import { openDB } from 'idb';

const DB_NAME = 'exerciseDB';
const DB_VERSION = 1;
const STORE_NAME = 'exercises';

let dbPromise = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('bodyPart', 'bodyPart', { unique: false });
          store.createIndex('equipment', 'equipment', { unique: false });
          store.createIndex('target', 'target', { unique: false });
          store.createIndex('name', 'name', { unique: false });
        }
      },
    });
  }
  return dbPromise;
}

export async function putExercise(exercise) {
  const db = await getDb();
  await db.put(STORE_NAME, exercise);
}

export async function putExercises(exercises) {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await Promise.all([
    ...exercises.map(ex => tx.store.put(ex)),
    tx.done,
  ]);
}

export async function getExercise(id) {
  const db = await getDb();
  return db.get(STORE_NAME, id);
}

export async function getAllExercises() {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

export async function getByBodyPart(bodyPart) {
  const db = await getDb();
  return db.getAllFromIndex(STORE_NAME, 'bodyPart', bodyPart);
}

export async function getExerciseCount() {
  const db = await getDb();
  return db.count(STORE_NAME);
}

export async function clearExercises() {
  const db = await getDb();
  await db.clear(STORE_NAME);
}
