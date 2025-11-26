const crypto = require('crypto');
const config = require('./config');
const db = require('./db');

// MD5 hash yaratish funksiyasi
const md5 = (string) => {
    return crypto.createHash('md5').update(string).digest('hex');
};

// Click so'rovlarini tekshirish va qayta ishlash
class ClickController {

    // Prepare metodi: To'lovni tayyorlash
    // Click bu metodni chaqirib, to'lovni amalga oshirish mumkinligini so'raydi
    async prepare(req, res) {
        try {
            const {
                click_trans_id,
                service_id,
                click_paydoc_id,
                merchant_trans_id,
                amount,
                action,
                error,
                error_note,
                sign_time,
                sign_string
            } = req.body;

            console.log('Prepare request:', req.body);

            // 1. Imzoni tekshirish (Signature check)
            // Formula: md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time)
            const generatedSignString = md5(
                click_trans_id +
                service_id +
                config.CLICK_SECRET_KEY +
                merchant_trans_id +
                amount +
                action +
                sign_time
            );

            if (sign_string !== generatedSignString) {
                return res.json({
                    error: -1,
                    error_note: "Sign check failed"
                });
            }

            // 2. Buyurtmani tekshirish
            const order = db.orders.find(o => o.id == merchant_trans_id);

            if (!order) {
                return res.json({
                    error: -5,
                    error_note: "User does not exist" // Yoki "Order not found"
                });
            }

            // 3. Summani tekshirish
            if (Math.abs(parseFloat(amount) - parseFloat(order.amount)) > 0.01) {
                return res.json({
                    error: -2,
                    error_note: "Incorrect parameter amount"
                });
            }

            // 4. Buyurtma holatini tekshirish (Agar allaqachon to'langan bo'lsa)
            if (order.status === 'paid') {
                return res.json({
                    error: -4,
                    error_note: "Already paid"
                });
            }

            // 5. Muvaffaqiyatli javob
            return res.json({
                click_trans_id: click_trans_id,
                merchant_trans_id: merchant_trans_id,
                merchant_prepare_id: Date.now(), // Yoki tranzaksiya ID si
                error: 0,
                error_note: "Success"
            });

        } catch (e) {
            console.error(e);
            return res.json({
                error: -8,
                error_note: "Error in request to merchant"
            });
        }
    }

    // Complete metodi: To'lovni yakunlash
    // Click bu metodni chaqirib, to'lov muvaffaqiyatli o'tganini bildiradi
    async complete(req, res) {
        try {
            const {
                click_trans_id,
                service_id,
                click_paydoc_id,
                merchant_trans_id,
                merchant_prepare_id,
                amount,
                action,
                error,
                error_note,
                sign_time,
                sign_string
            } = req.body;

            console.log('Complete request:', req.body);

            // 1. Imzoni tekshirish
            const generatedSignString = md5(
                click_trans_id +
                service_id +
                config.CLICK_SECRET_KEY +
                merchant_trans_id +
                merchant_prepare_id +
                amount +
                action +
                sign_time
            );

            if (sign_string !== generatedSignString) {
                return res.json({
                    error: -1,
                    error_note: "Sign check failed"
                });
            }

            // 2. Buyurtmani tekshirish
            const order = db.orders.find(o => o.id == merchant_trans_id);

            if (!order) {
                return res.json({
                    error: -5,
                    error_note: "User does not exist"
                });
            }

            // 3. Summani tekshirish
            if (Math.abs(parseFloat(amount) - parseFloat(order.amount)) > 0.01) {
                return res.json({
                    error: -2,
                    error_note: "Incorrect parameter amount"
                });
            }

            // 4. Agar to'lov allaqachon o'tgan bo'lsa
            if (order.status === 'paid') {
                return res.json({
                    click_trans_id: click_trans_id,
                    merchant_trans_id: merchant_trans_id,
                    merchant_confirm_id: order.transaction_id || Date.now(),
                    error: 0,
                    error_note: "Already paid"
                });
            }

            // 5. Agar Click tomonidan xatolik kelsa (error < 0)
            if (error < 0) {
                // Buyurtmani bekor qilish kerak bo'lsa shu yerda qilinadi
                return res.json({
                    error: -9,
                    error_note: "Transaction cancelled"
                });
            }

            // 6. To'lovni tasdiqlash va bazaga yozish
            order.status = 'paid';
            order.transaction_id = click_trans_id;

            db.transactions.push({
                click_trans_id,
                merchant_trans_id,
                amount,
                date: new Date()
            });

            return res.json({
                click_trans_id: click_trans_id,
                merchant_trans_id: merchant_trans_id,
                merchant_confirm_id: Date.now(),
                error: 0,
                error_note: "Success"
            });

        } catch (e) {
            console.error(e);
            return res.json({
                error: -8,
                error_note: "Error in request to merchant"
            });
        }
    }
}

module.exports = new ClickController();
