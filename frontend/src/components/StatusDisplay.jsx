// src/components/StatusDisplay.jsx
import React from 'react';
import { IoCashOutline } from 'react-icons/io5';
import overdueIcon from '../assets/overdue.svg';
import activeIcon from '../assets/active.svg';
import paidIcon from '../assets/paid.svg';
import cancelledIcon from '../assets/cancelled.svg';
import styles from '../styles/menu/LinkHistory.module.css';
import { getEffectiveTransactionStatus } from '../lib/utils';

export function getStatusDisplay(tx) {
  const now = new Date();
  const effectiveStatus = getEffectiveTransactionStatus(tx);

  switch (effectiveStatus) {
    case 'approved':
      return {
        icon: <img src={paidIcon} className={styles['status-icon']} alt="Pagado" />,
        label: 'Pagado',
        style: styles['status-paid'],
      };

    case 'pagado_efectivo':
      return {
        icon: <IoCashOutline className={`${styles['status-icon']} ${styles['icon-paid-effectivo']}`} />,
        label: 'Pagado en efectivo',
        style: styles['status-paid'],
      };

    case 'canceled':
    case 'denied':
      return {
        icon: <img src={cancelledIcon} className={styles['status-icon']} alt={effectiveStatus === 'canceled' ? 'Cancelado' : 'Rechazado'} />,
        label: effectiveStatus === 'canceled' ? 'Cancelado' : 'Rechazado',
        style: styles['status-cancelled'],
      };

    case 'expired':
      return {
        icon: <img src={overdueIcon} className={styles['status-icon']} alt="Vencido" />,
        label: 'Vencido',
        style: styles['status-overdue'],
      };

    case 'kueski_expired':
      return {
        icon: <img src={overdueIcon} className={styles['status-icon']} alt="Kueski expirado" />,
        label: 'Link Kueski expirado',
        style: styles['status-overdue'],
      };

    case 'pendiente_efectivo':
      return {
        icon: <IoCashOutline className={styles['status-icon']} />,
        label: 'Pendiente (efectivo)',
        style: styles['status-active'],
      };

    case 'pendiente': {
      const remainingMin = tx.kueski_created_at
        ? Math.floor(
            (new Date(tx.kueski_created_at).getTime() + 150 * 60000 - now.getTime()) / 60000
          )
        : null;

      return {
        icon: <img src={activeIcon} className={styles['status-icon']} alt="Activo" />,
        label: !tx.kueski_created_at
          ? 'Aún no enviado a Kueski'
          : `Esperando pago (${remainingMin} min)`,
        style: styles['status-active'],
      };
    }

    default:
      return {
        icon: <img src={overdueIcon} className={styles['status-icon']} alt="Desconocido" />,
        label: 'Estado desconocido',
        style: styles['status-overdue'],
      };
  }
}
