import { useState, useEffect } from 'react';
import api from '../api/client';
import { Badge, BADGE_ESTADO_ACTIVO, BADGE_ESTADO_MANT, fmtMoneda, fmtFecha, todayStr } from '../components/ui';

function KpiCard({ label, value, sub, bg, icon }) {
  return (
    <div style={{ background: bg, borderRadius: 10, padding: '18px 20px', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: '#718096', fontWeight: 500, marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a2332' }}>{value ?? '—'}</div>
          <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 2 }}>{sub}</div>
        </div>
        <div style={{ fontSize: 30 }}>{icon}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activos, setActivos] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [statsRes, activosRes, mantRes] = await Promise.all([
          api.get('/activos/stats/resumen'),
          api.get('/activos?limit=6'),
          api.get('/mantenimientos'),
        ]);
        setStats(statsRes.data);
        setActivos(activosRes.data.data || []);
        setMantenimientos(mantRes.data.slice(0, 5));
      } catch (err) {
        console.error('Error cargando dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#a0aec0' }}>Cargando dashboard...</div>;
  }

  const kpis = [
    { label: 'Total activos',       value: stats?.total,           sub: 'en inventario',   bg: '#f0f4f8', icon: '📦' },
    { label: 'Activos en uso',      value: stats?.activos,         sub: 'asignados',        bg: '#e6f4ea', icon: '✅' },
    { label: 'Disponibles',         value: stats?.disponibles,     sub: 'sin asignar',      bg: '#e3f2fd', icon: '📥' },
    { label: 'En mantenimiento',    value: stats?.enMant,          sub: 'temporalmente',    bg: '#fff8e1', icon: '🔧' },
    { label: 'Dados de baja',       value: stats?.dadosBaja,       sub: 'retirados',        bg: '#f7f0f0', icon: '🗑️' },
    { label: 'Garantías próximas',  value: stats?.garantiasVencen, sub: 'vencen en 90 días',bg: '#fce4ec', icon: '⚠️' },
  ];

  const tipoCount = ['Computador','Celular','Impresora','Red','Otro'].map(t => ({
    tipo: t, count: activos.filter(a => a.tipo === t).length,
  }));
  const maxTipo = Math.max(...tipoCount.map(x => x.count), 1);

  return (
    <div>
      <h2 style={{ margin: '0 0 22px', fontSize: 20, fontWeight: 700, color: '#1a2332' }}>Dashboard</h2>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Por tipo */}
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10, padding: '18px 20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#2d3748' }}>Distribución por tipo</h3>
          {tipoCount.map(b => (
            <div key={b.tipo} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#4a5568' }}>{b.tipo}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a2332' }}>{b.count}</span>
              </div>
              <div style={{ background: '#edf2f7', borderRadius: 999, height: 7, overflow: 'hidden' }}>
                <div style={{ width: `${(b.count / maxTipo) * 100}%`, background: '#1d6fa4', height: '100%', borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Últimos mantenimientos */}
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10, padding: '18px 20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#2d3748' }}>Últimos mantenimientos</h3>
          {mantenimientos.length === 0 && <p style={{ fontSize: 13, color: '#a0aec0' }}>Sin registros.</p>}
          {mantenimientos.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f4f8' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#2d3748' }}>{m.activo?.nombre || m.activo_id}</div>
                <div style={{ fontSize: 11, color: '#a0aec0' }}>{m.tipo} · {fmtFecha(m.fecha_programada)}</div>
              </div>
              <Badge text={m.estado} map={BADGE_ESTADO_MANT} />
            </div>
          ))}
        </div>
      </div>

      {/* Tabla activos recientes */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8ecf0' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#2d3748' }}>Activos recientes</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7fafc' }}>
              {['ID','Nombre','Tipo','Estado','Valor compra','Garantía hasta'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#718096', borderBottom: '1px solid #e8ecf0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activos.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                <td style={{ padding: '10px 16px', fontSize: 12, color: '#1d6fa4', fontWeight: 700 }}>{a.id}</td>
                <td style={{ padding: '10px 16px', fontSize: 13, color: '#2d3748', fontWeight: 500 }}>{a.nombre}</td>
                <td style={{ padding: '10px 16px', fontSize: 13, color: '#718096' }}>{a.tipo}</td>
                <td style={{ padding: '10px 16px' }}><Badge text={a.estado} map={BADGE_ESTADO_ACTIVO} /></td>
                <td style={{ padding: '10px 16px', fontSize: 13, color: '#2d3748' }}>{fmtMoneda(a.valor_compra)}</td>
                <td style={{ padding: '10px 16px', fontSize: 13, color: a.garantia_hasta < todayStr() ? '#c53030' : '#718096' }}>
                  {fmtFecha(a.garantia_hasta)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
