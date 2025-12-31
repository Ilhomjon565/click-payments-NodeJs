const crypto = require('crypto');
const axios = require('axios');
const config = require('./config');

// MD5 hash yaratish funksiyasi
const md5 = (string) => {
    return crypto.createHash('md5').update(string).digest('hex');
};

// EduCRM Backend bilan aloqa
const eduCrmApi = axios.create({
    baseURL: config.EDUCRM_BACKEND_URL,
    timeout: 30000
});

/**
 * Click error kodlari
 */
const CLICK_ERRORS = {
    SUCCESS: 0,
    SIGN_CHECK_FAILED: -1,
    INCORRECT_AMOUNT: -2,
    ACTION_NOT_FOUND: -3,
    ALREADY_PAID: -4,
    USER_NOT_FOUND: -5,
    TRANSACTION_NOT_FOUND: -6,
    UPDATE_FAILED: -7,
    REQUEST_ERROR: -8,
    TRANSACTION_CANCELLED: -9
};

/**
 * Click Controller
 */
class ClickController {

    /**
     * Prepare metodi: To'lovni tayyorlash
     * Click bu metodni chaqirib, to'lovni amalga oshirish mumkinligini so'raydi
     */
    async prepare(req, res) {
        try {
            const {
                click_trans_id,
                service_id,
                click_paydoc_id,
                merchant_trans_id,  // Bu bizning payment ID
                amount,
                action,
                error,
                error_note,
                sign_time,
                sign_string
            } = req.body;

            console.log('📥 Click Prepare request:', {
                click_trans_id,
                merchant_trans_id,
                amount,
                action,
                sign_time
            });

            // 1. Imzoni tekshirish
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
                console.error('❌ Sign check failed');
                return res.json({
                    error: CLICK_ERRORS.SIGN_CHECK_FAILED,
                    error_note: "Sign check failed"
                });
            }

            // 2. EduCRM Backend'dan to'lov ma'lumotlarini olish
            let payment;
            try {
                const response = await eduCrmApi.get(`/api/subscriptions/payments/${merchant_trans_id}/status`);
                payment = response.data.data;
            } catch (apiError) {
                console.error('❌ Payment not found:', merchant_trans_id);
                return res.json({
                    error: CLICK_ERRORS.USER_NOT_FOUND,
                    error_note: "Payment not found"
                });
            }

            if (!payment) {
                return res.json({
                    error: CLICK_ERRORS.USER_NOT_FOUND,
                    error_note: "Payment not found"
                });
            }

            // 3. Summani tekshirish
            if (Math.abs(parseFloat(amount) - parseFloat(payment.amount)) > 0.01) {
                console.error('❌ Amount mismatch:', { expected: payment.amount, received: amount });
                return res.json({
                    error: CLICK_ERRORS.INCORRECT_AMOUNT,
                    error_note: "Incorrect parameter amount"
                });
            }

            // 4. To'lov holati tekshirish
            if (payment.status === 'completed') {
                return res.json({
                    error: CLICK_ERRORS.ALREADY_PAID,
                    error_note: "Already paid"
                });
            }

            if (payment.status === 'cancelled') {
                return res.json({
                    error: CLICK_ERRORS.TRANSACTION_CANCELLED,
                    error_note: "Transaction cancelled"
                });
            }

            // 5. To'lovni "processing" holatiga o'tkazish
            try {
                await eduCrmApi.patch(`/api/subscriptions/payments/${merchant_trans_id}/prepare`, {
                    click_trans_id,
                    click_paydoc_id,
                    prepareId: Date.now().toString()
                });
            } catch (updateError) {
                console.warn('⚠️ Could not update payment status to processing');
            }

            // 6. Muvaffaqiyatli javob
            console.log('✅ Prepare success for payment:', merchant_trans_id);
            
            return res.json({
                click_trans_id: click_trans_id,
                merchant_trans_id: merchant_trans_id,
                merchant_prepare_id: Date.now(),
                error: CLICK_ERRORS.SUCCESS,
                error_note: "Success"
            });

        } catch (e) {
            console.error('❌ Prepare error:', e.message);
            return res.json({
                error: CLICK_ERRORS.REQUEST_ERROR,
                error_note: "Error in request to merchant"
            });
        }
    }

    /**
     * Complete metodi: To'lovni yakunlash
     * Click bu metodni chaqirib, to'lov muvaffaqiyatli o'tganini bildiradi
     */
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

            console.log('📥 Click Complete request:', {
                click_trans_id,
                merchant_trans_id,
                amount,
                action,
                error,
                sign_time
            });

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
                console.error('❌ Sign check failed');
                return res.json({
                    error: CLICK_ERRORS.SIGN_CHECK_FAILED,
                    error_note: "Sign check failed"
                });
            }

            // 2. EduCRM Backend'dan to'lov ma'lumotlarini olish
            let payment;
            try {
                const response = await eduCrmApi.get(`/api/subscriptions/payments/${merchant_trans_id}/status`);
                payment = response.data.data;
            } catch (apiError) {
                console.error('❌ Payment not found:', merchant_trans_id);
                return res.json({
                    error: CLICK_ERRORS.USER_NOT_FOUND,
                    error_note: "Payment not found"
                });
            }

            if (!payment) {
                return res.json({
                    error: CLICK_ERRORS.USER_NOT_FOUND,
                    error_note: "Payment not found"
                });
            }

            // 3. Summani tekshirish
            if (Math.abs(parseFloat(amount) - parseFloat(payment.amount)) > 0.01) {
                console.error('❌ Amount mismatch');
                return res.json({
                    error: CLICK_ERRORS.INCORRECT_AMOUNT,
                    error_note: "Incorrect parameter amount"
                });
            }

            // 4. Agar allaqachon to'langan bo'lsa
            if (payment.status === 'completed') {
                return res.json({
                    click_trans_id: click_trans_id,
                    merchant_trans_id: merchant_trans_id,
                    merchant_confirm_id: payment.transactionId || Date.now(),
                    error: CLICK_ERRORS.SUCCESS,
                    error_note: "Already paid"
                });
            }

            // 5. Agar Click tomonidan xatolik kelsa
            if (error < 0) {
                console.log('⚠️ Click reported error:', error, error_note);
                
                // To'lovni bekor qilish
                try {
                    await eduCrmApi.patch(`/api/subscriptions/payments/${merchant_trans_id}/cancel`, {
                        errorCode: error,
                        errorMessage: error_note || 'Transaction cancelled by Click'
                    });
                } catch (cancelError) {
                    console.warn('⚠️ Could not cancel payment');
                }

                return res.json({
                    error: CLICK_ERRORS.TRANSACTION_CANCELLED,
                    error_note: "Transaction cancelled"
                });
            }

            // 6. To'lovni tasdiqlash - EduCRM Backend'ga so'rov
            try {
                const confirmResponse = await eduCrmApi.post(
                    `/api/subscriptions/payments/${merchant_trans_id}/click-confirm`,
                    {
                        transactionId: click_trans_id.toString(),
                        click_trans_id,
                        click_paydoc_id,
                        metadata: {
                            click_trans_id,
                            click_paydoc_id,
                            merchant_prepare_id,
                            confirmed_at: new Date().toISOString()
                        }
                    }
                );

                console.log('✅ Payment confirmed:', merchant_trans_id);

                return res.json({
                    click_trans_id: click_trans_id,
                    merchant_trans_id: merchant_trans_id,
                    merchant_confirm_id: Date.now(),
                    error: CLICK_ERRORS.SUCCESS,
                    error_note: "Success"
                });

            } catch (confirmError) {
                console.error('❌ Could not confirm payment:', confirmError.message);
                return res.json({
                    error: CLICK_ERRORS.UPDATE_FAILED,
                    error_note: "Could not confirm payment"
                });
            }

        } catch (e) {
            console.error('❌ Complete error:', e.message);
            return res.json({
                error: CLICK_ERRORS.REQUEST_ERROR,
                error_note: "Error in request to merchant"
            });
        }
    }

    /**
     * To'lov holati tekshirish
     */
    async checkStatus(req, res) {
        try {
            const { paymentId } = req.params;

            const response = await eduCrmApi.get(`/api/subscriptions/payments/${paymentId}/status`);
            
            res.json({
                success: true,
                data: response.data.data
            });

        } catch (error) {
            console.error('Check status error:', error.message);
            res.status(error.response?.status || 500).json({
                success: false,
                message: 'To\'lov topilmadi yoki xatolik yuz berdi'
            });
        }
    }
}

module.exports = new ClickController();
