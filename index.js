const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));
app.use('/sila', express.static(path.join(__dirname, 'sila')));

// PWA manifest with correct headers
app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(__dirname, 'manifest.json'));
});

// Service worker with correct headers
app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(__dirname, 'sw.js'));
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'sila', 'dashboard.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'sila', 'dashboard.html'));
});

app.get('/pair', (req, res) => {
    res.sendFile(path.join(__dirname, 'pair.html'));
});

app.get('/config', (req, res) => {
    res.sendFile(path.join(__dirname, 'sila', 'config.html'));
});

app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'sila', 'admin-panel.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'sila', 'settings.html'));
});

app.get('/offline.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'offline.html'));
});

// Import bot router
const silaRouter = require('./sila');
app.use('/', silaRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api/') || req.path === '/code' || req.path === '/status') {
        res.status(404).json({ error: 'API endpoint not found' });
    } else {
        res.status(404).sendFile(path.join(__dirname, 'offline.html'));
    }
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║      🔐 MOMY-KIDY BOT SERVER v3.0 🔐                       ║
║                                                              ║
║      📡 Server running on port: ${port}                      ║
║      🌐 Dashboard: http://localhost:${port}/dashboard       ║
║      🔗 Pair Device: http://localhost:${port}/pair          ║
║                                                              ║
║      📱 PWA Installation:                                   ║
║         - Chrome: Look for install icon in address bar      ║
║         - Or click "Install App" button in dashboard        ║
║                                                              ║
║      👨‍💻 Developed By Sila Tech                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
