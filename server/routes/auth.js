const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();


// =======================
// ✅ Register Route
// =======================
router.post('/register', async (req, res) => {
  const { name, email, username, password, domain, skills, certifications } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      name,
      email,
      username,
      password: hashedPassword,
      domain: domain || '',
      skills: skills || [],
      certifications: certifications || []
    });

    await user.save();

    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('[Register Error]', err);
    res.status(500).json({ error: 'Something went wrong during registration' });
  }
});


// =======================
// ✅ Login Route
// =======================
router.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    // Find by email or username
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '3d',
    });

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        domain: user.domain || '',
        skills: user.skills || [],
        certifications: user.certifications || [],
      }
    });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ error: 'Something went wrong during login' });
  }
});


// =======================
// ✅ Get Profile (/me)
// =======================
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      domain: user.domain || '',
      skills: user.skills || [],
      certifications: user.certifications || []
    });
  } catch (err) {
    console.error('[Profile Fetch Error]', err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
});


module.exports = router;
