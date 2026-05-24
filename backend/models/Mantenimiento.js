const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mantenimiento = sequelize.define('Mantenimiento', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  activo_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    references: { model: 'activos', key: 'id' },
  },
  tipo: {
    type: DataTypes.ENUM('Preventivo', 'Correctivo'),
    allowNull: false,
  },
  fecha_programada: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  fecha_realizada: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  tecnico: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  costo: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
  },
  estado: {
    type: DataTypes.ENUM('Pendiente', 'En proceso', 'Completado'),
    defaultValue: 'Pendiente',
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'mantenimientos',
});

module.exports = Mantenimiento;
