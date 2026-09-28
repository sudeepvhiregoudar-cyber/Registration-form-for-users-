const fs = require('fs');
const path = require('path');

// Lightweight JSON-file "database" so the task runs with zero external
// services. Swap readAll/writeAll for a real driver (MongoDB, Postgres, etc.)
// to move this to production without touching the controller layer.
const DB_PATH = path.join(__dirname, '..', 'data', 'users.json');

function ensureStoreExists() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { nextId: 1, users: [] };
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
  }
}

function readStore() {
  ensureStoreExists();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeStore(store) {
  fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2));
}

function getAllUsers() {
  return readStore().users;
}

function getUserById(id) {
  return readStore().users.find((u) => u._id === Number(id));
}

function findByUsernameOrEmail(username, email) {
  const { users } = readStore();
  return users.find(
    (u) =>
      u.username.toLowerCase() === String(username).toLowerCase() ||
      u.email.toLowerCase() === String(email).toLowerCase()
  );
}

/**
 * Creates a user record.
 * _id auto-increments (integer), dateTime is generated server-side,
 * loginStatus defaults to "enabled" for a brand new account.
 */
function createUser({ fullName, username, email, phoneNumber, passwordHash }) {
  const store = readStore();
  const newUser = {
    _id: store.nextId,
    fullName,
    username,
    email,
    phoneNumber,
    password: passwordHash,
    dateTime: new Date().toISOString(),
    loginStatus: 'enabled', // "enabled" | "disabled"
  };
  store.users.push(newUser);
  store.nextId += 1;
  writeStore(store);
  return newUser;
}

/** Enable or disable a user's ability to log in. */
function setLoginStatus(id, status) {
  const store = readStore();
  const user = store.users.find((u) => u._id === Number(id));
  if (!user) return null;
  user.loginStatus = status;
  writeStore(store);
  return user;
}

function deleteUser(id) {
  const store = readStore();
  const lengthBefore = store.users.length;
  store.users = store.users.filter((u) => u._id !== Number(id));
  writeStore(store);
  return store.users.length < lengthBefore;
}

/** Strips the password hash before a user record leaves the API. */
function toPublicUser(user) {
  const { password, ...publicFields } = user;
  return publicFields;
}

module.exports = {
  getAllUsers,
  getUserById,
  findByUsernameOrEmail,
  createUser,
  setLoginStatus,
  deleteUser,
  toPublicUser,
};
