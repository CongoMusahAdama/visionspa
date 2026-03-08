const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent DoS
app.use(mongoSanitize()); // Prevent NoSQL Injection
app.use(xss()); // Prevent XSS vulnerabilities
app.use(cookieParser());
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://visionspa.netlify.app', 'https://visionspa.onrender.com'] // Allowed production origins
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Server frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../', 'dist', 'index.html'));
    });
} else {
    // Root route for development
    app.get('/', (req, res) => {
        res.send('Vision Spa API is running in development mode...');
    });
}

// Seed Admin if not exists
const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPhone = process.env.ADMIN_PHONE;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPhone || !adminPassword) {
            console.log("No ADMIN_ credentials found in .env, skipping seed.");
            return;
        }

        const adminData = {
            name: process.env.ADMIN_NAME || 'Florence Admin',
            email: adminEmail,
            phone: adminPhone,
            password: adminPassword,
            role: 'super-admin'
        };

        const adminExists = await Admin.findOne({
            $or: [{ email: adminEmail }, { phone: adminPhone }]
        });

        if (!adminExists) {
            await Admin.create(adminData);
            console.log('--- Default Admin Seeded Successfully ---');
        } else {
            // Update existing admin with latest .env credentials for development convenience
            adminExists.email = adminEmail;
            adminExists.phone = adminPhone;
            adminExists.password = adminPassword; // Pre-save middleware in Admin.js handles hashing
            await adminExists.save();
            console.log('--- Admin Credentials Synchronized ---');
        }
    } catch (error) {
        console.error('Seeding error:', error.message);
    }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await seedAdmin();
});

// Global Error Handler (Hides stack traces in production)
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});
