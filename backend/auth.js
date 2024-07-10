const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const usersFilePath = path.join(__dirname, 'users.json');
const secret = 'your_jwt_secret';

// Load users
const loadUsers = () => {
  if (fs.existsSync(usersFilePath)) {
    return JSON.parse(fs.readFileSync(usersFilePath));
  } 
  return [];
};

// Save users
const saveUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Signup
router.post(
  '/signup',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  (req, res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email, password} = req.body;
    const users = loadUsers();

    // User check
    if (users.find(user => user.email === email)) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = { email, password: hashedPassword };

    users.push(newUser);
    saveUsers(users);

    const token = jwt.sign({ email }, secret, { expiresIn: '1h' });
    res.json({ token });
  }
);

// Login
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email, password} = req.body;
    const users = loadUsers();

    const user = users.find(user => user.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ email }, secret, { expiresIn: '1h' });
    res.json({ token });
  }
);

module.exports = router;
