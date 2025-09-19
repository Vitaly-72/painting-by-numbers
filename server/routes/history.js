const express = require('express');
const auth = require('../middleware/auth');
const ProcessingHistory = require('../models/ProcessingHistory');
const router = express.Router();

// Получить историю пользователя
router.get('/', auth, async (req, res) => {
    try {
        const history = await ProcessingHistory.findByUserId(req.user.id);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Удалить запись истории
router.delete('/:id', auth, async (req, res) => {
    try {
        const result = await ProcessingHistory.delete(req.params.id, req.user.id);
        res.json({ success: result.changes > 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;