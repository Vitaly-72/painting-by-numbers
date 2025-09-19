const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const user = await User.create({ email, password, username });
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: user.id, email: user.email, username: user.username }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Логин
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await User.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, username: user.username }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;