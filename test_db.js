const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });
const Product = require('./backend/models/Product.js');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find().sort({ createdAt: -1 }).limit(3);
    console.log("Latest products:");
    products.forEach(p => {
        console.log(`Name: ${p.name}`);
        console.log(`Image: ${p.image}`);
        console.log(`Images: ${JSON.stringify(p.images)}`);
    });
    mongoose.disconnect();
}
test();
