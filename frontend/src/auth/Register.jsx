// src/auth/Register.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthActions } from '../hooks/useAuthActions';
import { supabase } from '../lib/supabase';
import styles from '../styles/auth/Register.module.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [tokenError, setTokenError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const [invitation, setInvitation] = useState(null);

  const { signUp } = useAuthActions();
  const navigate = useNavigate();

  // 1) Al montarse, si hay token en la URL, validamos que exista la invitación
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;

    const fetchInvitation = async () => {
      const { data, error } = await supabase
        .from('employee_invitations')
        .select('email, name')
        .eq('token', token)
        .eq('used', false)
        .maybeSingle();

      if (error || !data) {
        setTokenError('Este enlace no es válido o ya fue usado.');
      } else {
        setInvitation({ token, ...data });
        // Pre-fill el email de invitación
        setEmail(data.email);
      }
    };

    fetchInvitation();
  }, [searchParams]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // 2) Validación de contraseñas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    // 3) Si venimos de invitación, usamos ese email; si no, tomamos el input
    const token = invitation?.token;
    const finalEmail = invitation?.email || email.trim();

    // 4) Llamamos a signUp pasándole el token (o null)
    const { error: signUpError } = await signUp(finalEmail, password, token);

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 5) Navegamos a verify-email, preservando el token si existe
    navigate('/verify-email' + (token ? `?token=${token}` : ''), { replace: true });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.logo}><span>Kueski</span> Link</h1>

      <h2 className={styles.subtitle}>
        {invitation
          ? `Invitación para: ${invitation.name || invitation.email}`
          : 'Registra tu negocio y empieza a recibir pagos'}
      </h2>

      <form className={styles.form} onSubmit={handleRegister}>
        {/* Mostrar error de token si existe */}
        {tokenError && <p className={styles.error}>{tokenError}</p>}

        {/* Solo permitimos editar email si no venimos de invitación */}
        {!invitation && (
          <>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoComplete="email"
            />
          </>
        )}

        <label className={styles.label}>Contraseña</label>
        <input
          className={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          autoComplete="new-password"
        />

        <label className={styles.label}>Confirmar contraseña</label>
        <input
          className={styles.input}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          required
          autoComplete="new-password"
        />

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </form>

      <p className={styles.loginText}>
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className={styles.returnLogin}>
          Inicia Sesión
        </a>
      </p>
    </div>
  );
}

export default Register;
