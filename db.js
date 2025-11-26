// Vaqtinchalik ma'lumotlar bazasi (Mock DB)

const products = [
    { id: 1, name: "iPhone 15 Pro", price: 15000000 }, // 15 mln so'm
    { id: 2, name: "MacBook Air M2", price: 18000000 }, // 18 mln so'm
    { id: 3, name: "AirPods Pro", price: 3000000 } // 3 mln so'm
];

const orders = [
    // Buyurtmalar shu yerga tushadi
    // { id: 1, product_id: 1, amount: 15000000, status: 'waiting' | 'paid' | 'cancelled', user_id: 1 }
];

const transactions = [
    // Click tranzaksiyalari shu yerga tushadi
];

module.exports = {
    products,
    orders,
    transactions
};
