// src/links/LinkInfo.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import styles from '../styles/menu/LinkInfo.module.css';
import SubpageLayout from '../layouts/SubpageLayout';
import { getEffectiveTransactionStatus } from '../lib/utils';
import { getStatusDisplay } from '../components/StatusDisplay';
import { formatMoney } from '../lib/formatters';

function LinkInfo() {
  const { id } = useParams();
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLink = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        console.error('Error fetching link:', error?.message);
        setLoading(false);
        return;
      }

      const effectiveStatus = getEffectiveTransactionStatus(data);

      if (effectiveStatus !== data.status) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ status: effectiveStatus })
          .eq('id', id);
        if (updateError) {
          console.error('Error updating status:', updateError.message);
        } else {
          data.status = effectiveStatus;
        }
      }

      setLink({ ...data });
      setLoading(false);
    };

    fetchLink();
  }, [id]);

  const handleCancel = async () => {
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'canceled' })
      .eq('id', id);

    if (error) {
      console.error('Error cancelando:', error.message);
      navigate('/link-history', { replace: true, state: { fromCancelError: true } });
      return;
    }

    navigate('/link-history', { replace: true, state: { fromCancel: true } });
  };

  const handleMarkAsCash = async () => {
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'pagado_efectivo' })
      .eq('id', id);

    if (error) {
      console.error('Error marcando como efectivo:', error.message);
      navigate('/link-history', { replace: true, state: { fromCashError: true } });
      return;
    }

    navigate('/link-history', { replace: true, state: { fromCash: true } });
  };

  const handleResendLink = () => {
    const clientLink = `https://kueski-link.vercel.app/client-pay/${link.id}`;
    navigate('/send-link', {
      state: {
        paymentLink: clientLink,
      },
    });
  };

  if (loading) return <p>Cargando...</p>;
  if (!link) return <p>Transacción no encontrada.</p>;

  const status = getStatusDisplay(link);
  const clientLink = `${window.location.origin}/client-pay/${link.id}`;

  return (
    <SubpageLayout title="Información del Link" backLink="/link-history">
      <div className={styles.card}>
        <div className={`${styles.statusRow} ${status.style}`}>
          {typeof status.icon === 'string' ? (
            <img src={status.icon} className={styles.statusIcon} alt={status.label} />
          ) : (
            status.icon
          )}
          <span>{status.label}</span>
        </div>
        <hr />
        <p><strong>Concepto:</strong> {link.concept || 'Sin concepto'}</p>
        <p><strong>Monto:</strong> {formatMoney(link.amount)}</p>
        <p><strong>Fecha de creación:</strong> {new Date(link.created_at).toLocaleString()}</p>
        <p><strong>Fecha de expiración:</strong> {new Date(link.expiration_date).toLocaleString()}</p>
        <p><strong>Cliente:</strong> {link.customer_name || '-'}</p>
        <p><strong>Email:</strong> {link.customer_email || '-'}</p>
        <p><strong>Teléfono:</strong> {link.customer_phone || '-'}</p>
        <p><strong>Nota:</strong> {link.customer_request || '-'}</p>

        {(link.status === 'pendiente_efectivo' || link.status === 'pendiente') && (
          <div className={styles.actions}>
            {link.status === 'pendiente_efectivo' && (
              <button onClick={handleMarkAsCash}>Marcar como pagado</button>
            )}
            <button onClick={handleCancel}>Cancelar link</button>
            <button onClick={handleResendLink}>Reenviar link al cliente</button>
          </div>
        )}
      </div>
    </SubpageLayout>
  );
}

export default LinkInfo;
