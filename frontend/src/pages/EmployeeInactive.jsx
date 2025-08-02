// src/pages/EmployeeInactive.jsx
import styles from '../styles/pages/EmployeeInactive.module.css'

import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';


function EmployeeInactive() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <h1 className={styles.title}>
        <span className={styles.kueski}>Kueski</span>{' '}
        <span className={styles.link}>Link</span>
      </h1>
      <div className={styles['main-container']}>
          <h2 className={styles['main-text']}>Tu cuenta ha sido desactivada</h2>
          <p className={styles['sub-text']}>
            Por favor contacta al administrador de la empresa para más información.
          </p>

          <div>
            <button onClick={handleLogout} className={styles.button}>
              Cerrar sesión
            </button>
          </div>
      </div>
    </>
  );
}

export default EmployeeInactive;
