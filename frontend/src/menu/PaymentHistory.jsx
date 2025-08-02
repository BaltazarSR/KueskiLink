// src/menu/PaymentHistory.jsx
import styles from '../styles/menu/PaymentHistory.module.css';
import SubpageLayout from '../layouts/SubpageLayout'
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';

function PaymentHistory() {
    const { profile } = useUser();
    const [payments, setPayments] = useState([]);
    const [grouped, setGrouped] = useState({});

    useEffect(() => {
        const fetchPayments = async () => {
            if (!profile?.company?.id) return;

            const { data, error } = await supabase
                .from('transactions')
                .select('amount, customer_name, concept, created_at, status')
                .eq('company_id', profile.company.id)
                .in('status', ['approved', 'pagado_efectivo'])
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error al cargar los pagos:', error.message);
                return;
            }

            const mapped = (data || []).map(payment => ({
                amount: payment.amount,
                author: payment.customer_name || 'Cliente desconocido',
                concept: payment.concept || 'Sin concepto',
                date: new Date(payment.created_at)
            }));

            setPayments(mapped);
        };

        fetchPayments();
    }, [profile]);

    useEffect(() => {
        const groupByDate = (payments) => {
            const groups = {};
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            payments.forEach(payment => {
                const paymentDate = payment.date;
                let label;
                if (
                    paymentDate.getDate() === today.getDate() &&
                    paymentDate.getMonth() === today.getMonth() &&
                    paymentDate.getFullYear() === today.getFullYear()
                ) {
                    label = 'Hoy';
                } else if (
                    paymentDate.getDate() === yesterday.getDate() &&
                    paymentDate.getMonth() === yesterday.getMonth() &&
                    paymentDate.getFullYear() === yesterday.getFullYear()
                ) {
                    label = 'Ayer';
                } else {
                    label = paymentDate.toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    });
                }
                if (!groups[label]) groups[label] = [];
                groups[label].push(payment);
            });
            return groups;
        };

        setGrouped(groupByDate(payments));
    }, [payments]);

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

    return (
        <SubpageLayout>
            <div>
                <h1 className={styles['title-paybalta']}>Historial de pagos</h1>
                <div className={styles['payments-container']}>
                    {Object.entries(grouped).map(([date, payments]) => (
                        <div key={date}>
                            <div className={styles.date}>{date}</div>
                            {payments.map((payment, idx) => (
                                <div className={styles.payment} key={idx}>
                                    <div className={styles.amount}>
                                        {formatCompactAmount(payment.amount)}
                                    </div>
                                    <div className={styles['payment-body']}>
                                        <div className={styles['payment-title']}>
                                            {payment.author}
                                        </div>
                                        <div className={styles['payment-text']}>
                                            {payment.concept}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <hr />
                        </div>
                    ))}
                </div>
            </div>
        </SubpageLayout>
    )
}

export default PaymentHistory