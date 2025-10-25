const express = require('express');
const router = express.Router();
const User = require('../models/User');


router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {

    const newUser = new User({ username, email, password, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});


module.exports = router;
