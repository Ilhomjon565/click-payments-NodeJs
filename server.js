const express = require('express');
const bodyParser = require('body-parser');
const clickController = require('./click.controller');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 1. Mahsulotlarni olish
app.get('/api/products', (req, res) => {
    res.json(db.products);
});

// 2. Buyurtma yaratish (Foydalanuvchi mahsulot sotib olmoqchi bo'lganda)
app.post('/api/orders', (req, res) => {
    const { product_id, user_id } = req.body;

    const product = db.products.find(p => p.id == product_id);
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    const newOrder = {
        id: db.orders.length + 1, // Oddiy ID generatsiya
        product_id: product.id,
        amount: product.price,
        status: 'waiting',
        user_id: user_id || 1,
        created_at: new Date()
    };

    db.orders.push(newOrder);

    res.json({
        message: "Order created",
        order: newOrder,
        // Click uchun to'lov linkini generatsiya qilish mumkin shu yerda
        // click_url: `https://my.click.uz/services/pay?service_id=...&merchant_id=...&amount=${product.price}&transaction_param=${newOrder.id}`
    });
});

// 3. Click Prepare Endpoint
app.post('/api/click/prepare', clickController.prepare);

// 4. Click Complete Endpoint
app.post('/api/click/complete', clickController.complete);

// Serverni ishga tushirish
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Click Prepare URL: http://localhost:${PORT}/api/click/prepare`);
    console.log(`Click Complete URL: http://localhost:${PORT}/api/click/complete`);
});
