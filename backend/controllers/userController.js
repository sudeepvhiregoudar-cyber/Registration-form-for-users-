const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

const SALT_ROUNDS = 10;

async function registerUser(req, res) {
  try {
    const { fullName, username, email, phoneNumber, password } = req.body;

    const existing = userModel.findByUsernameOrEmail(username, email);
    if (existing) {
      const field = existing.username.toLowerCase() === username.toLowerCase() ? 'username' : 'email';
      return res.status(409).json({
        success: false,
        errors: { [field]: `That ${field} is already registered.` },
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = userModel.createUser({
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      passwordHash,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: userModel.toPublicUser(user),
    });
  } catch (err) {
    console.error('registerUser error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
}

function listUsers(req, res) {
  const users = userModel.getAllUsers().map(userModel.toPublicUser);
  return res.status(200).json({ success: true, count: users.length, data: users });
}

function getUser(req, res) {
  const user = userModel.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  return res.status(200).json({ success: true, data: userModel.toPublicUser(user) });
}

function updateLoginStatus(req, res) {
  const { status } = req.body;
  if (!['enabled', 'disabled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'status must be "enabled" or "disabled".' });
  }

  const user = userModel.setLoginStatus(req.params.id, status);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  return res.status(200).json({ success: true, data: userModel.toPublicUser(user) });
}

function removeUser(req, res) {
  const deleted = userModel.deleteUser(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  return res.status(200).json({ success: true, message: 'User deleted.' });
}

module.exports = { registerUser, listUsers, getUser, updateLoginStatus, removeUser };
