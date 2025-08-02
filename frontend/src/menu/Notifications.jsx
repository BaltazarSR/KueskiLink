// src/menu/Notifications.jsx
import { useUser } from '../context/UserContext';
import { useNotifications } from '../hooks/useNotifications';
import SubpageLayout from '../layouts/SubpageLayout';
import styles from '../styles/menu/Notifications.module.css';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

// Icons
import externalLink from '../assets/external-link.svg';
import dolarSign from '../assets/dolar-sign.svg';
import link from '../assets/link.svg';
import person from '../assets/person.svg';

const ICONS = {
  link_created: { icon: externalLink, style: 'status-link' },
  payment_approved: { icon: dolarSign, style: 'status-paid' },
  payment_failed: { icon: link, style: 'status-failed' },
  customer_message: { icon: link, style: 'status-message' },
  employee_registered: { icon: person, style: 'status-user' }
};

function groupByDate(notifications) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  return notifications.reduce((groups, notif) => {
    const dateStr = new Date(notif.created_at).toDateString();
    let label;

    if (dateStr === today) {
      label = 'Hoy';
    } else if (dateStr === yesterday) {
      label = 'Ayer';
    } else {
      label = format(new Date(notif.created_at), "d 'de' MMMM 'de' yyyy", { locale: es });
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(notif);
    return groups;
  }, {});
}

export default function Notifications() {
  const { profile } = useUser();
  const { notifications, loading } = useNotifications(profile);
  const navigate = useNavigate();

  const grouped = groupByDate(notifications);

  const handleClick = (notif) => {
    if (notif.transaction_id) {
      navigate(`/link-info/${notif.transaction_id}`);
    }
  };

  if (loading) {
    return (
      <SubpageLayout title="Notificaciones">
        <p>Cargando...</p>
      </SubpageLayout>
    );
  }

  return (
    <SubpageLayout title="Notificaciones">
      <h1>Notificaciones</h1>
      <div className={styles['notifications-container']}>
        {Object.entries(grouped).length === 0 ? (
          <p>No hay notificaciones.</p>
        ) : (
          Object.entries(grouped).map(([label, items]) => (
            <div key={label}>
              <h3 className={styles.dateLabel}>{label}</h3>
              {items.map((notif) => {
                const { icon, style } = ICONS[notif.type] || ICONS.link_created;
                const isClickable = !!notif.transaction_id;

                return (
                  <div
                    key={notif.id}
                    className={`${styles.notification} ${isClickable ? styles.clickable : ''}`}
                    onClick={() => isClickable && handleClick(notif)}
                    title={isClickable ? 'Haz clic para ver más detalles' : ''}
                    role={isClickable ? 'button' : 'group'}
                  >
                    <div className={styles[style]}>
                      <img className={styles['notification-icon']} src={icon} alt={notif.type} />
                    </div>
                    <div className={styles['notification-body']}>
                      <div className={styles['notification-title']}>{notif.title}</div>
                      <div className={styles['notification-text']}>
                        {notif.body || 'Sin detalles disponibles.'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </SubpageLayout>
  );
}
