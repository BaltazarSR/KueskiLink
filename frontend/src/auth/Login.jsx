// src/auth/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useAuthActions } from '../hooks/useAuthActions';
import styles from '../styles/auth/Login.module.css';

function Login() {
  const { user, profile, loading } = useUser();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (user && profile) {
      switch (profile.role) {
        case 'owner':
          navigate('/admin');
          break;
        case 'employee':
          navigate('/employee');
          break;
        default:
          navigate('/');
      }
    }

    if (user && !profile && !loading) {
      navigate('/complete-profile');
    }
  }, [user, profile, loading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setFormLoading(true);

    const { error: loginError } = await signIn(email, password);

    if (loginError) {
      setError(loginError.message);
      setFormLoading(false);
      return;
    }

    setFormLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.logo}>
        <span>Kueski</span> Link
      </h1>
      <h2 className={styles.subtitle}>Bienvenido de vuelta</h2>

      <form className={styles.form} onSubmit={handleLogin}>
        <label className={styles.label}>Email</label>
        <input
          className={styles.input}
          type="email"
          placeholder="Correo electrónico..."
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={formLoading}
          required
        />

        <label className={styles.label}>Contraseña</label>
        <input
          className={styles.input}
          type="password"
          placeholder="Contraseña..."
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={formLoading}
          required
        />

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.button} type="submit" disabled={formLoading}>
          {formLoading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <p className={styles.forgot}>¿Olvidaste tu contraseña?</p>

      <p className={styles.register}>
        ¿Aún no tienes cuenta? <a href="/register">Crear cuenta</a>
      </p>
    </div>
  );
}

export default Login;
