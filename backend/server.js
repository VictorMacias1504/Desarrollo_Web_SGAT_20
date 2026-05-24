require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, Usuario } = require('./models');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globales
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/activos', require('./routes/activos'));
app.use('/api/mantenimientos', require('./routes/mantenimientos'));
app.use('/api/usuarios', require('./routes/usuarios'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada.` });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

// Inicializar BD y servidor
sequelize.sync({ alter: true }).then(async () => {
  console.log('Base de datos SQLite sincronizada.');

  // Crear admin por defecto si no existe
  const adminExiste = await Usuario.findOne({ where: { email: 'admin@sgat.com' } });
  if (!adminExiste) {
    await Usuario.create({
      nombre: 'Administrador SGAT',
      email: 'admin@sgat.com',
      password: await bcrypt.hash('Admin1234', 10),
      rol: 'admin',
      estado: 'activo',
    });
    console.log('Usuario administrador creado: admin@sgat.com / Admin1234');
  }

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(err => {
  console.error('Error al conectar con la base de datos:', err);
  process.exit(1);
});
