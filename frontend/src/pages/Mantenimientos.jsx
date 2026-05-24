import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Badge, Modal, Confirm, Field, Alert,
  inputSt, selectSt, btnPrimary, btnSecondary,
  BADGE_ESTADO_MANT, fmtMoneda, fmtFecha,
} from '../components/ui';

const VACIO = {
  activo_id: '', tipo: 'Preventivo', fecha_programada: '',
  fecha_realizada: '', tecnico: '', costo: '', estado: 'Pendiente', descripcion: '',
};

export default function Mantenimientos() {
  const { user } = useAuth();
  const [mantenimientos, setMantenimientos] = useState([]);
  const [activos, setActivos] = useState([]);
  const [filtro, setFiltro] = useState({ estado: '', tipo: '', buscar: '' });
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtro.estado) params.estado = filtro.estado;
      if (filtro.tipo) params.tipo = filtro.tipo;
      if (filtro.buscar) params.buscar = filtro.buscar;
      const { data } = await api.get('/mantenimientos', { params });
      setMantenimientos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    api.get('/activos?limit=200').then(r => setActivos(r.data.data || [])).catch(() => {});
  }, []);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const openAdd = () => { setForm(VACIO); setEditId(null); setErr(''); setModal(true); };
  const openEdit = (m) => { setForm({ ...m, costo: m.costo || '', fecha_realizada: m.fecha_realizada || '' }); setEditId(m.id); setErr(''); setModal(true); };

  const guardar = async () => {
    if (!form.activo_id) { setErr('Selecciona un activo.'); return; }
    if (!form.fecha_programada) { setErr('La fecha programada es obligatoria.'); return; }
    setSaving(true); setErr('');
    try {
      const payload = { ...form, costo: parseFloat(form.costo) || 0, fecha_realizada: form.fecha_realizada || null };
      if (editId) await api.put(`/mantenimientos/${editId}`, payload);
      else await api.post('/mantenimientos', payload);
      setModal(false);
      cargar();
    } catch (e) {
      setErr(e.response?.data?.error || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id) => {
    try {
      await api.delete(`/mantenimientos/${id}`);
      setConfirm(null);
      cargar();
    } catch (e) { console.error(e); }
  };

  const estadoColor = (e) => ({
    'Pendiente': '#e65100', 'En proceso': '#1565c0', 'Completado': '#1e6e42'
  }[e] || '#555');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a2332' }}>Gestión de Mantenimientos</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>{mantenimientos.length} registro{mantenimientos.length !== 1 ? 's' : ''}</p>
        </div>
        {user?.rol === 'admin' && (
          <button onClick={openAdd} style={btnPrimary}>+ Registrar Mantenimiento</button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input style={{ ...inputSt, width: 230 }} placeholder="Buscar por activo o técnico..."
          value={filtro.buscar} onChange={e => setFiltro(f => ({ ...f, buscar: e.target.value }))} />
        <select style={{ ...selectSt, width: 160 }} value={filtro.tipo}
          onChange={e => setFiltro(f => ({ ...f, tipo: e.target.value }))}>
          <option value="">Todos los tipos</option>
          <option>Preventivo</option><option>Correctivo</option>
        </select>
        <select style={{ ...selectSt, width: 170 }} value={filtro.estado}
          onChange={e => setFiltro(f => ({ ...f, estado: e.target.value }))}>
          <option value="">Todos los estados</option>
          <option>Pendiente</option><option>En proceso</option><option>Completado</option>
        </select>
        {(filtro.buscar || filtro.tipo || filtro.estado) && (
          <button onClick={() => setFiltro({ estado: '', tipo: '', buscar: '' })}
            style={{ ...btnSecondary, fontSize: 13 }}>✕ Limpiar</button>
        )}
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#a0aec0' }}>Cargando...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc' }}>
                {['#', 'Activo', 'Tipo', 'Técnico', 'F. Programada', 'F. Realizada', 'Costo', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#718096', borderBottom: '1px solid #e8ecf0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mantenimientos.length === 0 && (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#a0aec0', fontSize: 14 }}>No hay registros de mantenimiento.</td></tr>
              )}
              {mantenimientos.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#a0aec0' }}>#{m.id}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#2d3748' }}>{m.activo?.nombre || m.activo_id}</div>
                    <div style={{ fontSize: 11, color: '#1d6fa4' }}>{m.activo_id}</div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      background: m.tipo === 'Preventivo' ? '#e6f4ea' : '#fce4ec',
                      color: m.tipo === 'Preventivo' ? '#1e6e42' : '#b71c1c',
                      padding: '2px 8px', borderRadius: 999, fontSize: 12,
                    }}>{m.tipo}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#4a5568' }}>{m.tecnico || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#718096' }}>{fmtFecha(m.fecha_programada)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#718096' }}>{fmtFecha(m.fecha_realizada)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#2d3748' }}>{m.costo > 0 ? fmtMoneda(m.costo) : '—'}</td>
                  <td style={{ padding: '10px 14px' }}><Badge text={m.estado} map={BADGE_ESTADO_MANT} /></td>
                  <td style={{ padding: '10px 14px' }}>
                    {user?.rol === 'admin' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(m)} style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #bee3f8', background: '#ebf8ff', color: '#2b6cb0', cursor: 'pointer', fontSize: 12 }}>Editar</button>
                        <button onClick={() => setConfirm(m.id)} style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #fed7d7', background: '#fff5f5', color: '#c53030', cursor: 'pointer', fontSize: 12 }}>Eliminar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <Modal title={editId ? 'Editar Mantenimiento' : 'Registrar Mantenimiento'} onClose={() => setModal(false)}>
          <Alert msg={err} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Activo" required style={{ gridColumn: 'span 2' }}>
              <select style={selectSt} value={form.activo_id} onChange={e => setF('activo_id', e.target.value)}>
                <option value="">Seleccionar activo...</option>
                {activos.filter(a => a.estado !== 'Dado de baja').map(a => (
                  <option key={a.id} value={a.id}>{a.id} — {a.nombre}</option>
                ))}
              </select>
            </Field>
            <Field label="Tipo de mantenimiento">
              <select style={selectSt} value={form.tipo} onChange={e => setF('tipo', e.target.value)}>
                <option>Preventivo</option><option>Correctivo</option>
              </select>
            </Field>
            <Field label="Estado">
              <select style={selectSt} value={form.estado} onChange={e => setF('estado', e.target.value)}>
                <option>Pendiente</option><option>En proceso</option><option>Completado</option>
              </select>
            </Field>
            <Field label="Fecha programada" required>
              <input style={inputSt} type="date" value={form.fecha_programada} onChange={e => setF('fecha_programada', e.target.value)} />
            </Field>
            <Field label="Fecha realizada">
              <input style={inputSt} type="date" value={form.fecha_realizada} onChange={e => setF('fecha_realizada', e.target.value)} />
            </Field>
            <Field label="Técnico responsable">
              <input style={inputSt} value={form.tecnico} onChange={e => setF('tecnico', e.target.value)} placeholder="Nombre del técnico" />
            </Field>
            <Field label="Costo (COP)">
              <input style={inputSt} type="number" value={form.costo} onChange={e => setF('costo', e.target.value)} placeholder="0" />
            </Field>
          </div>
          <Field label="Descripción / Observaciones">
            <textarea style={{ ...inputSt, height: 80, resize: 'vertical' }}
              value={form.descripcion} onChange={e => setF('descripcion', e.target.value)}
              placeholder="Detalle del trabajo realizado o a realizar..." />
          </Field>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={() => setModal(false)} style={btnSecondary}>Cancelar</button>
            <button onClick={guardar} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}

      {confirm && (
        <Confirm
          msg="¿Eliminar este registro de mantenimiento? Esta acción es permanente."
          onOk={() => eliminar(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
