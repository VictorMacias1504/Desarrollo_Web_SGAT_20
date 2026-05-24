const router = require('express').Router();
const { Op } = require('sequelize');
const { Activo, Usuario, Mantenimiento } = require('../models');
const { auth, soloAdmin } = require('../middleware/auth');

// GET /api/activos/stats/resumen
router.get('/stats/resumen', auth, async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const en90dias = new Date();
    en90dias.setDate(en90dias.getDate() + 90);
    const fecha90 = en90dias.toISOString().split('T')[0];

    const [total, activos, disponibles, enMant, dadosBaja, garantiasVencen] = await Promise.all([
      Activo.count(),
      Activo.count({ where: { estado: 'Activo' } }),
      Activo.count({ where: { estado: 'Disponible' } }),
      Activo.count({ where: { estado: 'Mantenimiento' } }),
      Activo.count({ where: { estado: 'Dado de baja' } }),
      Activo.count({
        where: {
          garantia_hasta: { [Op.between]: [hoy, fecha90] },
          estado: { [Op.ne]: 'Dado de baja' },
        },
      }),
    ]);

    res.json({ total, activos, disponibles, enMant, dadosBaja, garantiasVencen });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas.' });
  }
});

// GET /api/activos
router.get('/', auth, async (req, res) => {
  try {
    const { tipo, estado, buscar, page = 1, limit = 15 } = req.query;
    const where = {};

    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (buscar) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${buscar}%` } },
        { numero_serie: { [Op.like]: `%${buscar}%` } },
        { id: { [Op.like]: `%${buscar}%` } },
        { marca: { [Op.like]: `%${buscar}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows, count } = await Activo.findAndCountAll({
      where,
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email'] }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar activos.' });
  }
});

// GET /api/activos/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const activo = await Activo.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email'] },
        { model: Mantenimiento, as: 'mantenimientos', order: [['fecha_programada', 'DESC']] },
      ],
    });
    if (!activo) return res.status(404).json({ error: 'Activo no encontrado.' });
    res.json(activo);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el activo.' });
  }
});

// POST /api/activos
router.post('/', auth, soloAdmin, async (req, res) => {
  try {
    const { nombre, tipo, marca, modelo, numero_serie, fecha_compra,
      garantia_hasta, valor_compra, estado, ubicacion, observaciones, usuario_id } = req.body;

    if (!nombre || !tipo) {
      return res.status(400).json({ error: 'Nombre y tipo son obligatorios.' });
    }
    if (numero_serie) {
      const existe = await Activo.findOne({ where: { numero_serie } });
      if (existe) return res.status(409).json({ error: 'El número de serie ya existe.' });
    }

    // Generar ID legible
    const count = await Activo.count();
    const newId = `ACT-${String(count + 1).padStart(3, '0')}`;

    const activo = await Activo.create({
      id: newId, nombre, tipo, marca, modelo, numero_serie, fecha_compra,
      garantia_hasta, valor_compra: parseFloat(valor_compra) || 0,
      estado: estado || 'Disponible', ubicacion, observaciones,
      usuario_id: usuario_id || null,
    });

    res.status(201).json(activo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el activo.' });
  }
});

// PUT /api/activos/:id
router.put('/:id', auth, soloAdmin, async (req, res) => {
  try {
    const activo = await Activo.findByPk(req.params.id);
    if (!activo) return res.status(404).json({ error: 'Activo no encontrado.' });

    const { nombre, tipo, marca, modelo, numero_serie, fecha_compra,
      garantia_hasta, valor_compra, estado, ubicacion, observaciones, usuario_id } = req.body;

    await activo.update({
      nombre, tipo, marca, modelo, numero_serie, fecha_compra,
      garantia_hasta, valor_compra: parseFloat(valor_compra) || 0,
      estado, ubicacion, observaciones,
      usuario_id: usuario_id || null,
    });

    res.json(activo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el activo.' });
  }
});

// DELETE /api/activos/:id  — baja lógica
router.delete('/:id', auth, soloAdmin, async (req, res) => {
  try {
    const activo = await Activo.findByPk(req.params.id);
    if (!activo) return res.status(404).json({ error: 'Activo no encontrado.' });
    await activo.update({ estado: 'Dado de baja', usuario_id: null });
    res.json({ message: 'Activo dado de baja correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al dar de baja el activo.' });
  }
});

module.exports = router;
