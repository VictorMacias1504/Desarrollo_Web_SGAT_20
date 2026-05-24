const router = require('express').Router();
const { Op } = require('sequelize');
const { Mantenimiento, Activo } = require('../models');
const { auth, soloAdmin } = require('../middleware/auth');

// GET /api/mantenimientos
router.get('/', auth, async (req, res) => {
  try {
    const { estado, tipo, buscar, activo_id } = req.query;
    const where = {};

    if (estado) where.estado = estado;
    if (tipo) where.tipo = tipo;
    if (activo_id) where.activo_id = activo_id;
    if (buscar) {
      where[Op.or] = [
        { tecnico: { [Op.like]: `%${buscar}%` } },
        { activo_id: { [Op.like]: `%${buscar}%` } },
        { descripcion: { [Op.like]: `%${buscar}%` } },
      ];
    }

    const mantenimientos = await Mantenimiento.findAll({
      where,
      include: [{ model: Activo, as: 'activo', attributes: ['id', 'nombre', 'tipo', 'marca'] }],
      order: [['fecha_programada', 'DESC']],
    });

    res.json(mantenimientos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar mantenimientos.' });
  }
});

// GET /api/mantenimientos/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const m = await Mantenimiento.findByPk(req.params.id, {
      include: [{ model: Activo, as: 'activo' }],
    });
    if (!m) return res.status(404).json({ error: 'Mantenimiento no encontrado.' });
    res.json(m);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el mantenimiento.' });
  }
});

// POST /api/mantenimientos
router.post('/', auth, soloAdmin, async (req, res) => {
  try {
    const { activo_id, tipo, fecha_programada, fecha_realizada,
      tecnico, costo, estado, descripcion } = req.body;

    if (!activo_id || !tipo || !fecha_programada) {
      return res.status(400).json({ error: 'Activo, tipo y fecha programada son obligatorios.' });
    }

    const activo = await Activo.findByPk(activo_id);
    if (!activo) return res.status(404).json({ error: 'Activo no encontrado.' });

    const m = await Mantenimiento.create({
      activo_id, tipo, fecha_programada, fecha_realizada: fecha_realizada || null,
      tecnico, costo: parseFloat(costo) || 0, estado: estado || 'Pendiente', descripcion,
    });

    res.status(201).json(m);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar el mantenimiento.' });
  }
});

// PUT /api/mantenimientos/:id
router.put('/:id', auth, soloAdmin, async (req, res) => {
  try {
    const m = await Mantenimiento.findByPk(req.params.id);
    if (!m) return res.status(404).json({ error: 'Mantenimiento no encontrado.' });

    const { activo_id, tipo, fecha_programada, fecha_realizada,
      tecnico, costo, estado, descripcion } = req.body;

    await m.update({
      activo_id, tipo, fecha_programada,
      fecha_realizada: fecha_realizada || null,
      tecnico, costo: parseFloat(costo) || 0, estado, descripcion,
    });

    res.json(m);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el mantenimiento.' });
  }
});

// DELETE /api/mantenimientos/:id
router.delete('/:id', auth, soloAdmin, async (req, res) => {
  try {
    const m = await Mantenimiento.findByPk(req.params.id);
    if (!m) return res.status(404).json({ error: 'Mantenimiento no encontrado.' });
    await m.destroy();
    res.json({ message: 'Mantenimiento eliminado.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el mantenimiento.' });
  }
});

module.exports = router;
