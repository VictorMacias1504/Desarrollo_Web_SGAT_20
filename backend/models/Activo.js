const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Activo = sequelize.define('Activo', {
  id: {
    type: DataTypes.STRING(20),
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { notEmpty: true },
  },
  tipo: {
    type: DataTypes.ENUM('Computador', 'Celular', 'Impresora', 'Red', 'Otro'),
    allowNull: false,
  },
  marca: {
    type: DataTypes.STRING(80),
    allowNull: true,
  },
  modelo: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  numero_serie: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true,
  },
  fecha_compra: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  garantia_hasta: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  valor_compra: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
  },
  estado: {
    type: DataTypes.ENUM('Activo', 'Disponible', 'Mantenimiento', 'Dado de baja'),
    defaultValue: 'Disponible',
  },
  ubicacion: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'usuarios', key: 'id' },
  },
}, {
  tableName: 'activos',
});

module.exports = Activo;
