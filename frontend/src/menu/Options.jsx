// src/menu/Options.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import SubpageLayout from '../layouts/SubpageLayout';
import styles from '../styles/pages/Options.module.css';

// Íconos
import error from '../assets/error.svg';
import inbox from '../assets/inbox.svg';
import notifications from '../assets/notifications.svg';
import groups from '../assets/gmail_groups.svg';
import folder from '../assets/folder_filled.svg';
import dollarSign from '../assets/dollar-sign.svg';
import buttonIcon from '../assets/chevron-right-option.svg';

/**
 * Componente reutilizable para mostrar una opción del menú.
 */
function OptionItem({ icon, title, description, path, showDot }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
  };

  return (
    <div className={styles.option}>
      <div className={styles.optionIcon}>
        <img src={icon} alt={title} />
        {showDot && <span className={styles.notificationDot}></span>}
      </div>
      <div className={styles.optionText}>
        <h2 className={styles.title}>{title}</h2>
        <p>{description}</p>
      </div>
      <div className={styles.optionButton}>
        <button onClick={handleClick}>
          <img src={buttonIcon} alt="Abrir opción" />
        </button>
      </div>
    </div>
  );
}

/**
 * Página que muestra las distintas opciones que puede gestionar el usuario.
 */
function Options() {
  const { profile } = useUser();
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    const checkUnread = async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('read', false);

      if (!error && count > 0) {
        setHasUnreadNotifications(true);
      }
    };

    checkUnread();
  }, []);

  const options = [
    {
      icon: notifications,
      title: 'Notificaciones',
      description: 'Información sobre tu cuenta',
      path: '/notifications',
      showDot: hasUnreadNotifications
    },
    {
      icon: folder,
      title: 'Historial de links',
      description: 'Lista de los links enviados',
      path: '/link-history'
    },
    ...(profile?.isOwner
      ? [
          {
            icon: dollarSign,
            title: 'Historial de pagos',
            description: 'Lista de los pagos recibidos',
            path: '/payment-history'
          },
          {
            icon: inbox,
            title: 'Gestión de productos',
            description: 'Administra los productos registrados',
            path: '/products'
          },
          {
            icon: groups,
            title: 'Gestión de empleados',
            description: 'Administra los colaboradores',
            path: '/employees'
          }
        ]
      : []),
    {
      icon: error,
      title: 'Ayuda',
      description: 'Respuesta a tus dudas',
      path: '/help'
    }
  ];

  return (
    <SubpageLayout fallbackPath="/">
      <div>
        <h1>¡Hola, {profile?.name || 'Usuario'}!</h1>
      </div>

      <section>
        {options.map((option, idx) => (
          <OptionItem key={idx} {...option} />
        ))}
      </section>
    </SubpageLayout>
  );
}

export default Options;
