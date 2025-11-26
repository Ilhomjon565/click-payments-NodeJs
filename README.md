# 💳 Click.uz To'lov Tizimi Integratsiyasi (Backend)

Ushbu loyiha **Click.uz** to'lov tizimini **Node.js** va **Express** yordamida integratsiya qilish uchun tayyorlangan oddiy va tushunarli backend namunasidir.

Bu loyiha orqali siz o'z veb-saytingiz yoki ilovangizga Click orqali to'lovlarni qabul qilish funksiyasini qo'shishingiz mumkin.

---

## 🚀 Imkoniyatlar

- 📦 **Mahsulotlar ro'yxati**: Mavjud mahsulotlarni API orqali olish.
- 🛒 **Buyurtma yaratish**: Foydalanuvchi uchun yangi buyurtma ochish.
- 🔄 **Click Integratsiyasi**:
  - `Prepare`: To'lovni tekshirish va tayyorlash.
  - `Complete`: To'lovni yakunlash va tasdiqlash.
- 🛡️ **Xavfsizlik**: MD5 hash orqali so'rovlarni tekshirish (Basic).

---

## 🛠️ O'rnatish va Ishga tushirish

Loyihani kompyuteringizga o'rnatish uchun quyidagi qadamlarni bajaring:

### 1. Repozitoriyni yuklab olish
```bash
git clone https://github.com/username/project-name.git
cd project-name
```

### 2. Kerakli kutubxonalarni o'rnatish
```bash
npm install
```

### 3. Sozlamalarni to'g'irlash
`config.js` faylini oching va Click Merchant ma'lumotlaringizni kiriting:

```javascript
module.exports = {
    CLICK_SERVICE_ID: 'SIZNING_SERVICE_ID',
    CLICK_MERCHANT_ID: 'SIZNING_MERCHANT_ID',
    CLICK_SECRET_KEY: 'SIZNING_SECRET_KEY',
    CLICK_MERCHANT_USER_ID: 'SIZNING_USER_ID'
};
```

### 4. Loyihani ishga tushirish

**Ishlab chiqish rejimi (Development):**
```bash
npm run dev
```

**Oddiy rejim:**
```bash
npm start
```

Server odatda `http://localhost:3000` manzilida ishga tushadi.

---

## 🔌 API Hujjatlari

### 1. Mahsulotlarni olish
Barcha mavjud mahsulotlarni qaytaradi.
- **URL**: `/api/products`
- **Method**: `GET`

### 2. Buyurtma yaratish
Yangi buyurtma yaratish uchun.
- **URL**: `/api/orders`
- **Method**: `POST`
- **Body**:
```json
{
  "product_id": 1,
  "user_id": 101
}
```

### 3. Click Prepare (To'lovni tekshirish)
Click tizimi tomonidan yuboriladigan so'rov.
- **URL**: `/api/click/prepare`
- **Method**: `POST`

### 4. Click Complete (To'lovni yakunlash)
Click tizimi tomonidan to'lov muvaffaqiyatli amalga oshirilganda yuboriladigan so'rov.
- **URL**: `/api/click/complete`
- **Method**: `POST`

---

## 📂 Loyiha Tuzilmasi

- `server.js` - Asosiy server fayli va API marshrutlari.
- `click.controller.js` - Click so'rovlarini qayta ishlash logikasi.
- `config.js` - Konfiguratsiya va kalitlar.
- `db.js` - Vaqtincha ma'lumotlar bazasi (Mock DB).

---

## 📝 Eslatma

Bu loyiha **o'quv va namuna** maqsadida yaratilgan. Haqiqiy loyihada ma'lumotlar bazasi (PostgreSQL, MongoDB va h.k.) va xavfsizlik choralarini kuchaytirishingiz tavsiya etiladi.
