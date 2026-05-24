require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize, Usuario, Activo, Mantenimiento } = require('../models');
const bcrypt = require('bcryptjs');

async function seed() {
  await sequelize.sync({ force: true });
  console.log('Base de datos sincronizada y tablas recreadas.');

  // Usuarios
  const usuarios = await Usuario.bulkCreate([
    { nombre: 'Victor Macias', email: 'admin@sgat.com', password: await bcrypt.hash('Admin1234', 10), rol: 'admin', estado: 'activo' },
    { nombre: 'Luis Toscano', email: 'ltoscano@sgat.com', password: await bcrypt.hash('Luis5678', 10), rol: 'viewer', estado: 'activo' },
    { nombre: 'Andrea Romero', email: 'aromero@sgat.com', password: await bcrypt.hash('Andrea91', 10), rol: 'viewer', estado: 'activo' },
  ], { individualHooks: false });
  console.log(`✓ ${usuarios.length} usuarios creados.`);

  // Activos
  const activos = await Activo.bulkCreate([
    { id: 'ACT-001', nombre: 'Laptop Dell XPS 15', tipo: 'Computador', marca: 'Dell', modelo: 'XPS 15 9530', numero_serie: 'SN-DL9530-001', fecha_compra: '2023-03-12', garantia_hasta: '2026-03-12', valor_compra: 4200000, estado: 'Activo', ubicacion: 'Oficina 301', observaciones: 'Asignada al área de desarrollo', usuario_id: 1 },
    { id: 'ACT-002', nombre: 'iPhone 14 Pro', tipo: 'Celular', marca: 'Apple', modelo: 'iPhone 14 Pro', numero_serie: 'SN-APL14P-002', fecha_compra: '2023-06-01', garantia_hasta: '2025-06-01', valor_compra: 3800000, estado: 'Disponible', ubicacion: 'Almacén TI', observaciones: 'Sin asignar', usuario_id: null },
    { id: 'ACT-003', nombre: 'Switch Cisco SG350', tipo: 'Red', marca: 'Cisco', modelo: 'SG350-28', numero_serie: 'SN-CSC350-003', fecha_compra: '2022-11-20', garantia_hasta: '2026-11-20', valor_compra: 1850000, estado: 'Activo', ubicacion: 'Rack principal', observaciones: 'Switch de distribución piso 3', usuario_id: null },
    { id: 'ACT-004', nombre: 'Impresora HP LaserJet', tipo: 'Impresora', marca: 'HP', modelo: 'LaserJet Pro M404', numero_serie: 'SN-HP404-004', fecha_compra: '2022-05-14', garantia_hasta: '2025-05-14', valor_compra: 980000, estado: 'Mantenimiento', ubicacion: 'Sala de impresión', observaciones: 'En mantenimiento por atasco frecuente', usuario_id: null },
    { id: 'ACT-005', nombre: 'MacBook Pro M2', tipo: 'Computador', marca: 'Apple', modelo: 'MacBook Pro 14" M2', numero_serie: 'SN-APM2-005', fecha_compra: '2023-09-05', garantia_hasta: '2026-07-10', valor_compra: 7200000, estado: 'Activo', ubicacion: 'Sala de diseño', observaciones: 'Equipo de diseño UX', usuario_id: 3 },
    { id: 'ACT-006', nombre: 'Samsung Galaxy A54', tipo: 'Celular', marca: 'Samsung', modelo: 'Galaxy A54 5G', numero_serie: 'SN-SGA54-006', fecha_compra: '2023-04-28', garantia_hasta: '2025-04-28', valor_compra: 1450000, estado: 'Dado de baja', ubicacion: 'Almacén TI', observaciones: 'Pantalla rota, sin reparación viable', usuario_id: null },
    { id: 'ACT-007', nombre: 'Router Mikrotik hEX', tipo: 'Red', marca: 'Mikrotik', modelo: 'hEX RB750Gr3', numero_serie: 'SN-MTK750-007', fecha_compra: '2021-12-01', garantia_hasta: '2026-06-15', valor_compra: 420000, estado: 'Activo', ubicacion: 'Cuarto de redes', observaciones: 'Router edge principal', usuario_id: null },
    { id: 'ACT-008', nombre: 'Lenovo ThinkPad E14', tipo: 'Computador', marca: 'Lenovo', modelo: 'ThinkPad E14 Gen 4', numero_serie: 'SN-LNV14-008', fecha_compra: '2024-01-10', garantia_hasta: '2027-01-10', valor_compra: 3100000, estado: 'Disponible', ubicacion: 'Almacén TI', observaciones: 'Nueva adquisición sin asignar', usuario_id: null },
  ]);
  console.log(`✓ ${activos.length} activos creados.`);

  // Mantenimientos
  const mantenimientos = await Mantenimiento.bulkCreate([
    { activo_id: 'ACT-004', tipo: 'Correctivo', fecha_programada: '2026-05-15', fecha_realizada: null, tecnico: 'Servicio Técnico HP', costo: 180000, estado: 'En proceso', descripcion: 'Reparación de sistema de arrastre de papel, limpieza general' },
    { activo_id: 'ACT-001', tipo: 'Preventivo', fecha_programada: '2026-04-20', fecha_realizada: '2026-04-22', tecnico: 'Carlos Pérez', costo: 80000, estado: 'Completado', descripcion: 'Limpieza, actualización de drivers y sistema operativo' },
    { activo_id: 'ACT-003', tipo: 'Preventivo', fecha_programada: '2026-06-01', fecha_realizada: null, tecnico: 'Pedro Suárez', costo: 120000, estado: 'Pendiente', descripcion: 'Actualización de firmware y revisión de puertos' },
    { activo_id: 'ACT-005', tipo: 'Preventivo', fecha_programada: '2025-12-10', fecha_realizada: '2025-12-11', tecnico: 'Soporte Apple', costo: 0, estado: 'Completado', descripcion: 'Diagnóstico general y actualización macOS' },
  ]);
  console.log(`✓ ${mantenimientos.length} mantenimientos creados.`);

  console.log('\n✅ Seed completado exitosamente.');
  console.log('   Admin: admin@sgat.com / Admin1234');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});
