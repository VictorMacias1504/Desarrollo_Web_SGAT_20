const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Activo = require('./Activo');
const Mantenimiento = require('./Mantenimiento');

// Relaciones
Usuario.hasMany(Activo, { foreignKey: 'usuario_id', as: 'activos' });
Activo.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Activo.hasMany(Mantenimiento, { foreignKey: 'activo_id', as: 'mantenimientos' });
Mantenimiento.belongsTo(Activo, { foreignKey: 'activo_id', as: 'activo' });

module.exports = { sequelize, Usuario, Activo, Mantenimiento };
