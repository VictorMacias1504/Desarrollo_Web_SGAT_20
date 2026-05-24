import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { inputSt, Alert } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('admin@sgat.com');
  const [password, setPassword] = useState('Admin1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0f1e33',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: '42px 44px',
        width: 380, boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🖥️</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1e33' }}>SGAT</h1>
          <p style={{ margin: '6px 0 0', color: '#718096', fontSize: 13, lineHeight: 1.4 }}>
            Sistema de Gestión de Activos Tecnológicos<br />
            <span style={{ fontSize: 11 }}>Universidad de la Costa – CUC</span>
          </p>
        </div>

        <Alert msg={error} />

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a5568', marginBottom: 5 }}>
              Correo electrónico
            </label>
            <input
              style={inputSt} type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="usuario@sgat.com"
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a5568', marginBottom: 5 }}>
              Contraseña
            </label>
            <input
              style={inputSt} type="password" required
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '11px', background: loading ? '#7bafd4' : '#1d6fa4',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#a0aec0' }}>
          Demo: admin@sgat.com / Admin1234
        </p>
      </div>
    </div>
  );
}
