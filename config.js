module.exports = {
    // Click Merchant ma'lumotlari - EduCRM (director.educrm.uz)
    CLICK_SERVICE_ID: process.env.CLICK_SERVICE_ID || '75359',
    CLICK_MERCHANT_ID: process.env.CLICK_MERCHANT_ID || '20579',
    CLICK_SECRET_KEY: process.env.CLICK_SECRET_KEY || 'I1oOCEvUWqo',
    CLICK_MERCHANT_USER_ID: process.env.CLICK_MERCHANT_USER_ID || '57619',
    
    // EduCRM Backend URL
    EDUCRM_BACKEND_URL: process.env.EDUCRM_BACKEND_URL || 'http://localhost:5000',
    
    // MongoDB connection (optional - for direct DB access)
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/edu_crm_db'
};
