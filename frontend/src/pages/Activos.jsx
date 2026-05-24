import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Badge, Modal, Confirm, Field, Alert,
  inputSt, selectSt, btnPrimary, btnSecondary,
  BADGE_ESTADO_ACTIVO, fmtMoneda, fmtFecha, todayStr,
} from '../components/ui';

const TIPOS = ['Computador', 'Celular', 'Impresora', 'Red', 'Otro'];
const ESTADOS = ['Activo', 'Disponible', 'Mantenimiento', 'Dado de baja'];

const VACIO = {
  nombre: '', tipo: 'Computador', marca: '', modelo: '',
  numero_serie: '', fecha_compra: '', garantia_hasta: '',
  valor_compra: '', estado: 'Disponible', ubicacion: '',
  observaciones: '', usuario_id: '',
};

export default function Activos() {
  const { user } = useAuth();
  const [activos, setActivos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filtro, setFiltro] = useState({ tipo: '', estado: '', buscar: '' });
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
      const params = { page, limit: 12, ...filtro };
      const { data } = await api.get('/activos', { params });
      setActivos(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, filtro]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    if (user?.rol === 'admin') {
      api.get('/usuarios').then(r => setUsuarios(r.data)).catch(() => {});
    }
  }, [user]);

  const openAdd = () => { setForm(VACIO); setEditId(null); setErr(''); setModal(true); };
  const openEdit = (a) => {
    setForm({ ...a, valor_compra: a.valor_compra || '', usuario_id: a.usuario_id || '' });
    setEditId(a.id); setErr(''); setModal(true);
  };

  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const guardar = async () => {
    if (!form.nombre.trim()) { setErr('El nombre es obligatorio.'); return; }
    if (!form.tipo) { setErr('Selecciona el tipo de activo.'); return; }
    setSaving(true); setErr('');
    try {
      const payload = {
        ...form,
        valor_compra: parseFloat(form.valor_compra) || 0,
        usuario_id: form.usuario_id ? parseInt(form.usuario_id) : null,
        fecha_compra: form.fecha_compra || null,
        garantia_hasta: form.garantia_hasta || null,
      };
      if (editId) await api.put(`/activos/${editId}`, payload);
      else await api.post('/activos', payload);
      setModal(false);
      cargar();
    } catch (e) {
      setErr(e.response?.data?.error || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const darBaja = async (id) => {
    try {
      await api.delete(`/activos/${id}`);
      setConfirm(null);
      cargar();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a2332' }}>Inventario de Activos</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>{total} activo{total !== 1 ? 's' : ''} en total</p>
        </div>
        {user?.rol === 'admin' && (
          <button onClick={openAdd} style={btnPrimary}>+ Nuevo Activo</button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          style={{ ...inputSt, width: 240 }}
          placeholder="Buscar por nombre, ID, serie, marca..."
          value={filtro.buscar}
          onChange={e => { setFiltro(f => ({ ...f, buscar: e.target.value })); setPage(1); }}
        />
        <select style={{ ...selectSt, width: 170 }} value={filtro.tipo}
          onChange={e => { setFiltro(f => ({ ...f, tipo: e.target.value })); setPage(1); }}>
          <option value="">Todos los tipos</option>
          {TIPOS.map(t => <option key={t}>{t}</option>)}
        </select>
        <select style={{ ...selectSt, width: 185 }} value={filtro.estado}
          onChange={e => { setFiltro(f => ({ ...f, estado: e.target.value })); setPage(1); }}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(s => <option key={s}>{s}</option>)}
        </select>
        {(filtro.buscar || filtro.tipo || filtro.estado) && (
          <button onClick={() => { setFiltro({ tipo: '', estado: '', buscar: '' }); setPage(1); }}
            style={{ ...btnSecondary, fontSize: 13 }}>✕ Limpiar</button>
        )}
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#a0aec0' }}>Cargando activos...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc' }}>
                {['ID', 'Nombre', 'Tipo', 'Marca / Modelo', 'Estado', 'Garantía', 'Asignado a', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#718096', borderBottom: '1px solid #e8ecf0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activos.length === 0 && (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#a0aec0', fontSize: 14 }}>No se encontraron activos.</td></tr>
              )}
              {activos.map(a => {
                const garantExp = a.garantia_hasta && a.garantia_hasta < todayStr();
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#1d6fa4', fontWeight: 700 }}>{a.id}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#2d3748' }}>{a.nombre}</div>
                      {a.ubicacion && <div style={{ fontSize: 11, color: '#a0aec0' }}>📍 {a.ubicacion}</div>}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#718096' }}>{a.tipo}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#718096' }}>
                      {[a.marca, a.modelo].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}><Badge text={a.estado} map={BADGE_ESTADO_ACTIVO} /></td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: garantExp ? '#c53030' : '#718096' }}>
                      {fmtFecha(a.garantia_hasta)}{garantExp && ' ⚠️'}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#718096' }}>
                      {a.usuario ? a.usuario.nombre : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {user?.rol === 'admin' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(a)} style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #bee3f8', background: '#ebf8ff', color: '#2b6cb0', cursor: 'pointer', fontSize: 12 }}>Editar</button>
                          {a.estado !== 'Dado de baja' && (
                            <button onClick={() => setConfirm(a.id)} style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #fed7d7', background: '#fff5f5', color: '#c53030', cursor: 'pointer', fontSize: 12 }}>Baja</button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {pages > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ ...btnSecondary, padding: '6px 14px', opacity: page === 1 ? 0.4 : 1 }}>‹</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              padding: '6px 14px', borderRadius: 6,
              border: page === p ? '1px solid #1d6fa4' : '1px solid #e2e8f0',
              background: page === p ? '#1d6fa4' : '#fff',
              color: page === p ? '#fff' : '#2d3748',
              cursor: 'pointer', fontWeight: page === p ? 600 : 400,
            }}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            style={{ ...btnSecondary, padding: '6px 14px', opacity: page === pages ? 0.4 : 1 }}>›</button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal title={editId ? 'Editar Activo' : 'Registrar Nuevo Activo'} onClose={() => setModal(false)} wide>
          <Alert msg={err} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Nombre del activo" required>
              <input style={inputSt} value={form.nombre} onChange={e => setF('nombre', e.target.value)} placeholder="Ej: Laptop Dell XPS 15" />
            </Field>
            <Field label="Tipo" required>
              <select style={selectSt} value={form.tipo} onChange={e => setF('tipo', e.target.value)}>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Marca">
              <input style={inputSt} value={form.marca} onChange={e => setF('marca', e.target.value)} placeholder="Dell, Apple, HP..." />
            </Field>
            <Field label="Modelo">
              <input style={inputSt} value={form.modelo} onChange={e => setF('modelo', e.target.value)} placeholder="XPS 15 9530..." />
            </Field>
            <Field label="Número de serie">
              <input style={inputSt} value={form.numero_serie} onChange={e => setF('numero_serie', e.target.value)} placeholder="SN-XXXXXX-000" />
            </Field>
            <Field label="Estado">
              <select style={selectSt} value={form.estado} onChange={e => setF('estado', e.target.value)}>
                {ESTADOS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Fecha de compra">
              <input style={inputSt} type="date" value={form.fecha_compra} onChange={e => setF('fecha_compra', e.target.value)} />
            </Field>
            <Field label="Garantía hasta">
              <input style={inputSt} type="date" value={form.garantia_hasta} onChange={e => setF('garantia_hasta', e.target.value)} />
            </Field>
            <Field label="Valor de compra (COP)">
              <input style={inputSt} type="number" value={form.valor_compra} onChange={e => setF('valor_compra', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Ubicación">
              <input style={inputSt} value={form.ubicacion} onChange={e => setF('ubicacion', e.target.value)} placeholder="Oficina 301, Rack principal..." />
            </Field>
            {user?.rol === 'admin' && (
              <Field label="Asignar a usuario" style={{ gridColumn: 'span 2' }}>
                <select style={selectSt} value={form.usuario_id} onChange={e => setF('usuario_id', e.target.value)}>
                  <option value="">Sin asignar</option>
                  {usuarios.filter(u => u.estado === 'activo').map(u => (
                    <option key={u.id} value={u.id}>{u.nombre} ({u.email})</option>
                  ))}
                </select>
              </Field>
            )}
          </div>
          <Field label="Observaciones">
            <textarea style={{ ...inputSt, height: 72, resize: 'vertical' }} value={form.observaciones} onChange={e => setF('observaciones', e.target.value)} />
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
          msg={`¿Dar de baja el activo ${confirm}? El registro se conserva con estado "Dado de baja" para mantener trazabilidad.`}
          onOk={() => darBaja(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
