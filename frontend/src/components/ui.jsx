// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ text, map }) {
  const s = map?.[text] || { bg: '#f0f0f0', color: '#555' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 10px', borderRadius: 999,
      fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 12,
        width: wide ? 'min(680px,96vw)' : 'min(560px,94vw)',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px 14px', borderBottom: '1px solid #e8ecf0',
        }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#1a2332' }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 24,
            cursor: 'pointer', color: '#8090a0', lineHeight: 1,
          }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ── Confirm ───────────────────────────────────────────────────────────────────
export function Confirm({ msg, onOk, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '28px 32px',
        width: 340, textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <p style={{ margin: '0 0 22px', fontSize: 15, color: '#2d3748', lineHeight: 1.5 }}>{msg}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onCancel} style={btnSecondary}>Cancelar</button>
          <button onClick={onOk} style={{ ...btnPrimary, background: '#c53030' }}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
export function Field({ label, children, required, style }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a5568', marginBottom: 5 }}>
        {label}{required && <span style={{ color: '#e53e3e' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ msg, type = 'error' }) {
  if (!msg) return null;
  const styles = {
    error: { bg: '#fff5f5', border: '#fed7d7', color: '#c53030' },
    success: { bg: '#f0fff4', border: '#c6f6d5', color: '#276749' },
  };
  const s = styles[type];
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.color, padding: '10px 14px', borderRadius: 8,
      marginBottom: 16, fontSize: 13,
    }}>
      {msg}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
export const inputSt = {
  width: '100%', padding: '8px 12px',
  border: '1px solid #d1d9e0', borderRadius: 7,
  fontSize: 14, color: '#1a2332', background: '#fff',
  boxSizing: 'border-box', outline: 'none',
};
export const selectSt = { ...inputSt, cursor: 'pointer' };

export const btnPrimary = {
  padding: '9px 22px', borderRadius: 7, border: 'none',
  background: '#1d6fa4', color: '#fff', cursor: 'pointer',
  fontSize: 14, fontWeight: 500,
};
export const btnSecondary = {
  padding: '9px 20px', borderRadius: 7,
  border: '1px solid #e2e8f0', background: '#fff',
  cursor: 'pointer', fontSize: 14, color: '#4a5568',
};

export const BADGE_ESTADO_ACTIVO = {
  'Activo':       { bg: '#e6f4ea', color: '#1e6e42' },
  'Disponible':   { bg: '#e3f2fd', color: '#1565c0' },
  'Mantenimiento':{ bg: '#fff8e1', color: '#e65100' },
  'Dado de baja': { bg: '#fce4ec', color: '#b71c1c' },
};
export const BADGE_ESTADO_MANT = {
  'Pendiente':  { bg: '#fff8e1', color: '#e65100' },
  'En proceso': { bg: '#e3f2fd', color: '#1565c0' },
  'Completado': { bg: '#e6f4ea', color: '#1e6e42' },
};
export const BADGE_ROL = {
  'admin':  { bg: '#ede7f6', color: '#4527a0' },
  'viewer': { bg: '#e3f2fd', color: '#1565c0' },
};

export const fmtMoneda = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);

export const fmtFecha = (f) => {
  if (!f) return '—';
  const [y, m, d] = f.split('-');
  return `${d}/${m}/${y}`;
};

export const todayStr = () => new Date().toISOString().split('T')[0];
