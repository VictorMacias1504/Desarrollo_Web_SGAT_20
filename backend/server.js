require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, Usuario } = require('./models');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors({
  origin: '*',
  credentials: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', require('./routes/auth'));
app.use('/api/activos', require('./routes/activos'));
app.use('/api/mantenimientos', require('./routes/mantenimientos'));
app.use('/api/usuarios', require('./routes/usuarios'));


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada.` });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor.' });
});


sequelize.sync({ alter: true }).then(async () => {
  console.log('Base de datos SQLite sincronizada.');

  const adminExiste = await Usuario.findOne({ where: { email: 'admin@sgat.com' } });
  if (adminExiste) {
    await adminExiste.update({ password: 'Admin1234' });
  } else {
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
