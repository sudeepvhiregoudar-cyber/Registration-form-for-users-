const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;
const USERNAME_RE = /^[a-zA-Z0-9_.]{3,20}$/;

function validateRegistration(req, res, next) {
  const { fullName, username, email, phoneNumber, password, confirmPassword } = req.body;
  const errors = {};

  if (!fullName || !fullName.trim()) {
    errors.fullName = 'Full name is required.';
  }

  if (!username || !USERNAME_RE.test(username)) {
    errors.username = 'Username must be 3-20 characters (letters, numbers, . or _ only).';
  }

  if (!email || !EMAIL_RE.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!phoneNumber || !PHONE_RE.test(phoneNumber)) {
    errors.phoneNumber = 'Enter a valid phone number.';
  }

  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

module.exports = { validateRegistration };
