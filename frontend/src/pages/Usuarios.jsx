import { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Badge, Modal, Field, Alert,
  inputSt, selectSt, btnPrimary, btnSecondary,
  BADGE_ROL, fmtFecha,
} from '../components/ui';

const VACIO = { nombre: '', email: '', password: '', rol: 'viewer', estado: 'activo' };

export default function Usuarios() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  if (user?.rol !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
        <h3 style={{ color: '#2d3748', marginBottom: 8 }}>Acceso restringido</h3>
        <p style={{ color: '#a0aec0', fontSize: 14 }}>Solo los administradores pueden gestionar usuarios.</p>
      </div>
    );
  }

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/usuarios');
      setUsuarios(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const openAdd = () => { setForm(VACIO); setEditId(null); setErr(''); setModal(true); };
  const openEdit = (u) => { setForm({ ...u, password: '' }); setEditId(u.id); setErr(''); setModal(true); };

  const guardar = async () => {
    if (!form.nombre.trim()) { setErr('El nombre es obligatorio.'); return; }
    if (!form.email.includes('@')) { setErr('Email inválido.'); return; }
    if (!editId && !form.password) { setErr('La contraseña es obligatoria para nuevos usuarios.'); return; }
    setSaving(true); setErr('');
    try {
      const payload = { ...form };
      if (editId && !payload.password) delete payload.password;
      if (editId) await api.put(`/usuarios/${editId}`, payload);
      else await api.post('/usuarios', payload);
      setModal(false);
      cargar();
    } catch (e) {
      setErr(e.response?.data?.error || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const toggleEstado = async (id) => {
    try {
      await api.patch(`/usuarios/${id}/estado`);
      cargar();
    } catch (e) { console.error(e); }
  };

  const filtered = usuarios.filter(u => {
    if (!buscar) return true;
    const q = buscar.toLowerCase();
    return u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a2332' }}>Gestión de Usuarios</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>{usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrados</p>
        </div>
        <button onClick={openAdd} style={btnPrimary}>+ Nuevo Usuario</button>
      </div>

      <input style={{ ...inputSt, width: 280, marginBottom: 20 }}
        placeholder="Buscar por nombre o correo..."
        value={buscar} onChange={e => setBuscar(e.target.value)} />

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#a0aec0' }}>Cargando usuarios...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
          {filtered.map(u => (
            <div key={u.id} style={{
              background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10,
              padding: '20px', opacity: u.estado === 'inactivo' ? 0.65 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: u.rol === 'admin' ? '#ede7f6' : '#e3f2fd',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700,
                  color: u.rol === 'admin' ? '#4527a0' : '#1565c0',
                }}>
                  {u.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#2d3748', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.nombre}</div>
                  <div style={{ fontSize: 12, color: '#718096', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                <Badge text={u.rol} map={BADGE_ROL} />
                <span style={{
                  background: u.estado === 'activo' ? '#e6f4ea' : '#fce4ec',
                  color: u.estado === 'activo' ? '#1e6e42' : '#b71c1c',
                  padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                }}>{u.estado}</span>
              </div>

              <div style={{ fontSize: 11, color: '#a0aec0', marginBottom: 14 }}>
                Registrado: {fmtFecha(u.createdAt?.split('T')[0] || u.fecha_creacion)}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(u)} style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid #bee3f8', background: '#ebf8ff', color: '#2b6cb0', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                  Editar
                </button>
                {u.id !== user.id && (
                  <button onClick={() => toggleEstado(u.id)} style={{
                    flex: 1, padding: '7px 0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    border: u.estado === 'activo' ? '1px solid #fed7d7' : '1px solid #c6f6d5',
                    background: u.estado === 'activo' ? '#fff5f5' : '#f0fff4',
                    color: u.estado === 'activo' ? '#c53030' : '#276749',
                  }}>
                    {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: '#a0aec0', fontSize: 14 }}>
              No se encontraron usuarios.
            </div>
          )}
        </div>
      )}

      {modal && (
        <Modal title={editId ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={() => setModal(false)}>
          <Alert msg={err} />
          <Field label="Nombre completo" required>
            <input style={inputSt} value={form.nombre} onChange={e => setF('nombre', e.target.value)} placeholder="Ej: Carlos Pérez" />
          </Field>
          <Field label="Correo electrónico" required>
            <input style={inputSt} type="email" value={form.email} onChange={e => setF('email', e.target.value)} placeholder="usuario@empresa.com" />
          </Field>
          <Field label={editId ? 'Nueva contraseña (vacío = no cambiar)' : 'Contraseña'} required={!editId}>
            <input style={inputSt} type="password" value={form.password} onChange={e => setF('password', e.target.value)} placeholder={editId ? '••••••••' : 'Mínimo 8 caracteres'} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Rol">
              <select style={selectSt} value={form.rol} onChange={e => setF('rol', e.target.value)}>
                <option value="admin">Administrador</option>
                <option value="viewer">Visualizador</option>
              </select>
            </Field>
            <Field label="Estado">
              <select style={selectSt} value={form.estado} onChange={e => setF('estado', e.target.value)}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <button onClick={() => setModal(false)} style={btnSecondary}>Cancelar</button>
            <button onClick={guardar} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
