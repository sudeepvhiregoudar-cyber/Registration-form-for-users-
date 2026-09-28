const express = require('express');
const { validateRegistration } = require('../middleware/validate');
const {
  registerUser,
  listUsers,
  getUser,
  updateLoginStatus,
  removeUser,
} = require('../controllers/userController');

const router = express.Router();

// POST /api/users/register        -> create a new account
router.post('/register', validateRegistration, registerUser);

// GET  /api/users                 -> list all users (passwords excluded)
router.get('/', listUsers);

// GET  /api/users/:id             -> fetch a single user
router.get('/:id', getUser);

// PATCH /api/users/:id/status     -> enable / disable login access
router.patch('/:id/status', updateLoginStatus);

// DELETE /api/users/:id           -> remove a user
router.delete('/:id', removeUser);

module.exports = router;
