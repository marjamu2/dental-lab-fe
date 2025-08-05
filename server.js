
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authMiddleware = require('./middleware/auth');
const User = require('./models/User'); // Import User model

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Function to create a default admin user
const createDefaultAdmin = async () => {
    try {
        const adminEmail = 'admin@admin.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (!existingAdmin) {
            console.log('Usuario administrador por defecto no encontrado. Creando uno...');
            const adminUser = new User({
                email: adminEmail,
                password: 'admin', // The pre-save hook in the model will hash this
                role: 'admin'
            });
            await adminUser.save();
            console.log('Usuario administrador por defecto creado exitosamente.');
        } else {
            console.log('El usuario administrador por defecto ya existe.');
        }
    } catch (error) {
        console.error('Error al crear el usuario administrador por defecto:', error);
    }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado exitosamente.');
    // Create default admin user after successful connection
    createDefaultAdmin();
  })
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// API Routes
app.use('/api/auth', require('./routes/auth'));

// Protected Routes
app.use('/api/clients', authMiddleware, require('./routes/clients'));
app.use('/api/products', authMiddleware, require('./routes/products'));
app.use('/api/suppliers', authMiddleware, require('./routes/suppliers'));
app.use('/api/orders', authMiddleware, require('./routes/orders'));

// Health Check Route (public)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


// Start server
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});