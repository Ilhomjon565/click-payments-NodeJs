const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const clickController = require('./click.controller');
const config = require('./config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'click-payments',
        timestamp: new Date().toISOString()
    });
});

// API info
app.get('/api/info', (req, res) => {
    res.json({
        name: 'EduCRM Click Payment Service',
        version: '1.0.0',
        description: 'Click to\'lov integratsiyasi',
        endpoints: {
            prepare: '/api/click/prepare',
            complete: '/api/click/complete'
        }
    });
});

// Click Prepare Endpoint - To'lovni tayyorlash
app.post('/api/click/prepare', clickController.prepare);

// Click Complete Endpoint - To'lovni yakunlash
app.post('/api/click/complete', clickController.complete);

// To'lov holati tekshirish
app.get('/api/payments/:paymentId/status', clickController.checkStatus);

// Serverni ishga tushirish
app.listen(PORT, () => {
    console.log(`🚀 Click Payment Server is running on port ${PORT}`);
    console.log(`📍 Click Prepare URL: http://localhost:${PORT}/api/click/prepare`);
    console.log(`📍 Click Complete URL: http://localhost:${PORT}/api/click/complete`);
    console.log(`📍 EduCRM Backend URL: ${config.EDUCRM_BACKEND_URL}`);
});
