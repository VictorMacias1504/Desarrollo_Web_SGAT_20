const router = require('express').Router();
const { Usuario } = require('../models');
const { auth, soloAdmin } = require('../middleware/auth');

// GET /api/usuarios
router.get('/', auth, soloAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'ASC']],
    });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar usuarios.' });
  }
});

// GET /api/usuarios/:id
router.get('/:id', auth, soloAdmin, async (req, res) => {
  try {
    const u = await Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(u);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
});

// POST /api/usuarios
router.post('/', auth, soloAdmin, async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
    }
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) return res.status(409).json({ error: 'El email ya está registrado.' });

    const u = await Usuario.create({ nombre, email, password, rol: rol || 'viewer' });
    res.status(201).json({
      id: u.id, nombre: u.nombre, email: u.email, rol: u.rol, estado: u.estado,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el usuario.' });
  }
});

// PUT /api/usuarios/:id
router.put('/:id', auth, soloAdmin, async (req, res) => {
  try {
    const u = await Usuario.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const { nombre, email, password, rol, estado } = req.body;
    const updates = { nombre, email, rol, estado };
    if (password && password.trim() !== '') updates.password = password;

    await u.update(updates);
    res.json({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol, estado: u.estado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el usuario.' });
  }
});

// PATCH /api/usuarios/:id/estado
router.patch('/:id/estado', auth, soloAdmin, async (req, res) => {
  try {
    const u = await Usuario.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado.' });
    const nuevoEstado = u.estado === 'activo' ? 'inactivo' : 'activo';
    await u.update({ estado: nuevoEstado });
    res.json({ id: u.id, estado: nuevoEstado });
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar el estado.' });
  }
});

module.exports = router;
