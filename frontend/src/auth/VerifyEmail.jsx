// src/auth/VerifyEmail.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext'; 
import { useAuthActions } from '../hooks/useAuthActions';
import { CiMail } from "react-icons/ci";
import styles from '../styles/auth/VerifyEmail.module.css';

function VerifyEmail() {
  const { user, profile, loading } = useUser(); 
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false); 
  const navigate = useNavigate();
  const { resendVerification } = useAuthActions();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (loading) return; 
    if (user && profile) {
      navigate(profile.role === 'owner' ? '/admin' : '/create-link', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkVerification(false); 
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkVerification = async (manual = true) => {
    if (manual) {
      setChecking(true);
      setError(null);
    }

    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !user) {
      if (manual) {
        setError('Error al obtener tu sesión. Intenta de nuevo.');
        setChecking(false);
      }
      return;
    }

    if (user.email_confirmed_at) {
      navigate(`/complete-profile${token ? `?token=${token}` : ''}`, { replace: true });
    } else if (manual) {
      setError('Tu correo aún no ha sido verificado. Revisa tu bandeja de entrada.');
      setChecking(false);
    }
  };

  const handleResendVerification = async () => {
    setChecking(true);
    setError(null);

    const { user, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !user) {
      setError('No pudimos obtener tu sesión. Intenta iniciar sesión de nuevo.');
      setChecking(false);
      return;
    }

    const { error: resendError } = await resendVerification(user.email);

    if (resendError) {
      setError('Error al reenviar el correo de verificación.');
    } else {
      setError('Correo reenviado. Revisa tu bandeja de entrada.');
    }

    setChecking(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.logo}>
        <span className={styles.blue}>Kueski</span> Link
      </h1>

      <div className={styles.iconWrapper}>
        <CiMail className={styles.icon} />
      </div>


      <h2 className={styles.title}>Revisa tu correo</h2>
      <p className={styles.subtitle}>
        Te hemos enviado un enlace para confirmar tu cuenta
      </p>

      {error && <p className={styles.error}>{error}</p>}

      <button
        onClick={() => checkVerification(true)}
        className={styles.button}
        disabled={checking}
      >
        {checking ? 'Verificando...' : 'Listo'}
      </button>

      <p className={styles.resend}>
        ¿No recibiste correo?{' '}
        <span className={styles.resendLink} onClick={handleResendVerification}>
          Reenviar verificación
        </span>
      </p>

      <p className={styles.back} onClick={() => navigate(-1)}>
        ← Regresar
      </p>
    </div>
  );
}

export default VerifyEmail;
