// src/dashboard/EmployeeDashboard.jsx
import AuthenticatedLayout from '../layouts/AuthenticatedLayout'

// Importa los estilos CSS para este dashboard
import styles from '../styles/dashboard/EmployeeDashboard.module.css'

// Importa íconos para los diferentes estados de los links de pago
import activeIcon from '../assets/active.svg';
import overdueIcon from '../assets/overdue.svg';
import paidIcon from '../assets/paid.svg';
import cancelledIcon from '../assets/cancelled.svg';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

/**
 * Función compartida para interpretar el estado del link (igual que OwnerDashboard)
 */
function getStatusDisplay(link) {
    const now = new Date();
    const expires = new Date(link.expiration_date);
    const kueskiCreated = link.kueski_created_at ? new Date(link.kueski_created_at) : null;
    const remainingKueskiMin = kueskiCreated
        ? Math.floor((kueskiCreated.getTime() + 150 * 60000 - now.getTime()) / 60000)
        : null;

    switch (link.status) {
        case 'approved':
            return {
                icon: paidIcon,
                label: 'Pagado',
                className: styles.statusLinkValid,
            };
        case 'canceled':
        case 'denied':
            return {
                icon: cancelledIcon,
                label: link.status === 'denied' ? 'Rechazado' : 'Cancelado',
                className: styles.statusLinkCancelled,
            };
        case 'pendiente':
            if (now > expires) {
                return {
                    icon: overdueIcon,
                    label: 'Vencido',
                    className: styles.statusLinkInvalid,
                };
            }
            if (!kueskiCreated) {
                return {
                    icon: activeIcon,
                    label: 'Aún no enviado a Kueski',
                    className: styles.statusLinkPending,
                };
            }
            if (remainingKueskiMin > 0) {
                return {
                    icon: activeIcon,
                    label: `Esperando pago (${remainingKueskiMin} min)`,
                    className: styles.statusLinkPending,
                };
            }
            return {
                icon: overdueIcon,
                label: 'Link Kueski expirado',
                className: styles.statusLinkInvalid,
            };
        default:
            return {
                icon: overdueIcon,
                label: 'Estado desconocido',
                className: styles.statusLinkInvalid,
            };
    }
}

/**
 * Componente reutilizable para mostrar secciones del dashboard con título, contenido y un botón "Ver todos".
*/
function DashboardSection({ title, children, onViewAll }) {
    return (
        <section className={styles.section}>
            <h2 className={styles.titles}>{title}</h2>
            <div className={styles.content}>{children}</div>
            {onViewAll && (
                <button onClick={onViewAll} className={styles.viewAllBtn}>
                    Ver todos
                </button>
            )}
        </section>
    )
}

/**
 * Muestra un link de pago generado, con ícono de estado (aceptado, vencido, cancelado, inválido) y descripción.
*/
function LinkItem({ concept, icon, className, label }) {
    return (
        <div className={styles.recentLinks}>
            <div className={className}>
                <img src={icon} alt={label} className={styles.icon} />
            </div>
            <div className={styles.linkDetails}>
                <p className={styles.linkConcept}>{concept}</p>
                <p>{label}</p>
            </div>
        </div>
    );
}

/**
 * Componente principal del dashboard del empleado.
 * Solo muestra la sección de "Links generados".
*/
function EmployeeDashboard() {
    const [links, setLinks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLinks = async () => {
            const { data, error } = await supabase
                .from('transactions')
                .select('concept, status, expiration_date, created_at, kueski_created_at')
                .order('created_at', { ascending: false })
                .limit(4);

            if (error) {
                console.error('Error al cargar los links:', error.message);
                return;
            }

            // Igual que OwnerDashboard: mapea con getStatusDisplay
            const mapped = data.map(link => {
                const statusInfo = getStatusDisplay(link);
                return {
                    concept: link.concept || 'Sin concepto',
                    ...statusInfo
                };
            });

            setLinks(mapped);
        };

        fetchLinks();
    }, []);

    const handleViewAll = () => {
        navigate('/link-history');
    }

    const handleCreateLink = () => {
        navigate('/create-link');
    }

    return (
        <AuthenticatedLayout>
            <div className={styles.dashboard}>
                <DashboardSection title="Links generados" onViewAll={handleViewAll}>
                    {links.slice(0, 3).map((link, idx) => (
                        <LinkItem key={idx} {...link} />
                    ))}
                </DashboardSection>
            </div>

            <div className={styles.createLinkContainer}>
                <button className={styles.createLinkBtn} onClick={handleCreateLink}>
                    Crear link de pago
                </button>
            </div>
        </AuthenticatedLayout>
    )
}

export default EmployeeDashboard