const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const historyRoutes = require('./routes/history');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/history', historyRoutes);

// WebSocket для реального времени
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-user', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined room`);
    });

    socket.on('preview-request', async (data) => {
        try {
            // Обработка превью в реальном времени
            const { imageData, options } = data;
            // Здесь будет логика генерации превью
            socket.emit('preview-update', { preview: 'data:image/png;base64,...' });
        } catch (error) {
            socket.emit('preview-error', { error: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Статические страницы
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/profile.html'));
});

app.get('/history', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/history.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});