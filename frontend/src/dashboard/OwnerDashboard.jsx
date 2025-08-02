// src/dashboard/OwnerDashboard.jsx

// Importa el layout principal que se muestra cuando el usuario está autenticado
import AuthenticatedLayout from '../layouts/AuthenticatedLayout'

// Importa los estilos CSS para este dashboard
import styles from '../styles/dashboard/OwnerDashboard.module.css'

// Importa íconos para los diferentes estados de los links de pago
import activeIcon from '../assets/active.svg';
import overdueIcon from '../assets/overdue.svg';
import paidIcon from '../assets/paid.svg';
import cancelledIcon from '../assets/cancelled.svg';

// Importa navegación
import { useNavigate } from 'react-router-dom';

// Importar módulos para manjear datos dinámicos del dashboard
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Importa el contexto de usuario para obtener información del perfil
import { useUser } from '../context/UserContext';
import { IoCashOutline } from 'react-icons/io5';


function formatCompactAmount(amount) {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '+';

    if (abs >= 1_000_000) {
        return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
    } else if (abs >= 1_000) {
        return `${sign}$${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 2)}k`;
    } else {
        return `${sign}$${abs.toFixed(2)}`;
    }
}

/**
 * Función para mapear el estado interno de la transacción a un estado legible
 */
function getStatusDisplay(tx) {
    const now = new Date();
    const expires = new Date(tx.expiration_date);
    const kueskiCreated = tx.kueski_created_at;
    const remainingKueskiMin = kueskiCreated
        ? Math.floor(
            (new Date(kueskiCreated).getTime() + 150 * 60000 - now.getTime()) / 60000
        )
        : null;

    switch (tx.status) {
        case 'approved':
        case 'pagado_efectivo':
            return {
                icon: paidIcon,
                label: tx.status === 'pagado_efectivo' ? 'Pagado en efectivo' : 'Pagado',
                className: styles.statusLinkValid,
            };
        case 'canceled':
        case 'denied':
            return {
                icon: cancelledIcon,
                label: tx.status === 'denied' ? 'Rechazado' : 'Cancelado',
                className: styles.statusLinkCancelled,
            };
        case 'pendiente_efectivo':
            return {
                icon: activeIcon,
                label: 'Pendiente (efectivo)',
                className: styles.statusLinkPending,
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
 * Muestra un pago reciente, con cantidad, autor, concepto y fecha.
*/
function PaymentItem({ amount, author, concept, date }) {
    return (
        <div className={styles.recentPayments}>
            <div className={styles.paymentAmount}>
                <p>
                    {formatCompactAmount(amount)}
                </p>
            </div>
            <div className={styles.paymentDetails}>
                <p className={styles.paymentAutor}>{author}</p>
                <p>{concept}</p>
            </div>
            <div className={styles.paymentDate}><p>{date}</p></div>
        </div>
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
 * Muestra un producto o servicio con la cantidad total de ventas.
*/
function ProductItem({ quantity, concept }) {
    return (
        <div className={styles.sellingProducts}>
            <div className={styles.totalSales}><p>{quantity}</p></div>
            <div className={styles.salesDetails}>
                <p className={styles.saleConcept}>{concept}</p>
            </div>
        </div>
    )
}

/**
 * Componente principal del dashboard del dueño.
 * Muestra métricas clave como ventas totales, últimos pagos, links generados y productos más vendidos.
*/
function OwnerDashboard() {

    const navigate = useNavigate();

    // Estado para los links de pago cargados desde Supabase
    const [links, setLinks] = useState([]);

    // Obtener el usuario actual desde el contexto
    const { profile } = useUser();

    // Estado para los productos más vendidos
    const [products, setProducts] = useState([]);

    // Estado para los pagos recientes
    const [payments, setPayments] = useState([]);

    // Estado para el total de ventas
    const [totalSales, setTotalSales] = useState(0);

    // Cargar links recientes desde Supabase al montar el componente
    useEffect(() => {
        const fetchLinks = async () => {
            const { data, error } = await supabase
                .from('transactions')
                .select('concept, status, expiration_date, created_at, kueski_created_at')
                .order('created_at', { ascending: false })
                .limit(4); // solo los 4 más recientes

            if (error) {
                console.error('Error al cargar los links:', error.message);
                return;
            }

            // Formatear datos para usarlos en LinkItem
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

    // Cargar productos más vendidos desde Supabase al montar el componente
    useEffect(() => {
        const fetchTopProducts = async () => {
            if (!profile?.company?.id) return;

            const { data, error } = await supabase
                .from('products_transactions')
                .select(`
                    product_id,
                    quantity,
                    products (
                        name
                    ),
                    transactions (
                        company_id,
                        status
                    )
                `);

            if (error) {
                console.error('Error al obtener productos más vendidos:', error.message);
                return;
            }

            // Filtrar por la compañía y solo transacciones aprobadas
            const filtered = (data || []).filter(
            pt =>
                pt.transactions?.company_id === profile.company.id &&
                (
                    pt.transactions?.status === 'approved' ||
                    pt.transactions?.status === 'pagado_efectivo'
                )
            );

            // Agrupar y sumar cantidades por producto
            const salesMap = {};
            filtered.forEach(pt => {
                const key = pt.product_id;
                if (!salesMap[key]) {
                    salesMap[key] = {
                        quantity: 0,
                        concept: pt.products?.name || 'Producto desconocido'
                    };
                }
                salesMap[key].quantity += pt.quantity;
            });

            // Convertir a array y ordenar
            const sorted = Object.values(salesMap)
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 3);

            setProducts(sorted);
        };

        fetchTopProducts();
    }, [profile]);

    // Cargar pagos recientes desde Supabase al montar el componente
    useEffect(() => {
        const fetchPayments = async () => {
            if (!profile?.company?.id) return;

            const { data, error } = await supabase
                .from('transactions')
                .select('amount, customer_name, concept, created_at, status')
                .eq('company_id', profile.company.id)
                .in('status', ['approved', 'pagado_efectivo'])
                .order('created_at', { ascending: false })
                .limit(4);

            if (error) {
                console.error('Error al cargar los pagos:', error.message);
                return;
            }

            // Map data to match PaymentItem props
            const mapped = (data || []).map(payment => ({
                amount: payment.amount,
                author: payment.customer_name || 'Cliente desconocido',
                concept: payment.concept || 'Sin concepto',
                date: new Date(payment.created_at).toLocaleDateString('es-MX')
            }));

            setPayments(mapped);
        };

        fetchPayments();
    }, [profile]);

    // Calcular el total de ventas
    // Calcular el total de ventas desde la base de datos
    useEffect(() => {
        const fetchTotalSales = async () => {
            if (!profile?.company?.id) return;

            const { data, error } = await supabase
                .from('transactions')
                .select('amount')
                .eq('company_id', profile.company.id)
                .in('status', ['approved', 'pagado_efectivo']);

            if (error) {
                console.error('Error al calcular total de ventas:', error.message);
                return;
            }

            const total = (data || []).reduce((sum, tx) => sum + tx.amount, 0);
            setTotalSales(total);
        };

        fetchTotalSales();
    }, [profile]);


    const CreateLink = () => {
        navigate('/create-link'); 
    };

    const PaymentHistory = () => {
        navigate('/payment-history'); 
    };

    const LinkHistory = () => {
        navigate('/link-history'); 
    }

    const Products = () => {
        navigate('/products'); 
    }

    const Stats = () => {
        navigate('/stats'); 
    }

    return (
        <AuthenticatedLayout>
            <div className={styles.dashboard}>
                {/* Sección de total de ventas */}
                <section className={styles.section}>
                    <h2 className={styles.titles}>Total de ventas</h2>
                    <p className={styles.price}>
                      ${totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </section>

                {/* Sección de últimos pagos recibidos */}
                <DashboardSection title="Últimos pagos" onViewAll={PaymentHistory}>
                    {payments.slice(0,3).map((payment, idx) => (
                        <PaymentItem key={idx} {...payment} />
                    ))}
                </DashboardSection>

                {/* Sección de links de pago generados */}
                <DashboardSection title="Links generados" onViewAll={LinkHistory}>
                    {links.slice(0,3).map((link, idx) => (
                        <LinkItem key={idx} {...link} />
                    ))}
                </DashboardSection>

                {/* Sección de productos o servicios más vendidos */}
                <DashboardSection title="Productos más vendidos" onViewAll={Stats}>
                    {products.slice(0,3).map((product, idx) => (
                        <ProductItem key={idx} {...product} />
                    ))}
                </DashboardSection>
            </div>
            {/* Botón para crear un nuevo link de pago */}
            <div className={styles.createLinkContainer}>
                <button className={styles.createLinkBtn} onClick={CreateLink}>
                    Crear link de pago
                </button>
            </div>
        </AuthenticatedLayout>
    )
}

export default OwnerDashboard
