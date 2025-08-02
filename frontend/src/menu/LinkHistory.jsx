import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import styles from '../styles/menu/LinkHistory.module.css';
import SubpageLayout from '../layouts/SubpageLayout';
import { getStatusDisplay } from '../components/StatusDisplay';
import { getEffectiveTransactionStatus } from '../lib/utils';
import { formatMoney } from '../lib/formatters';
import { toast } from 'react-toastify';

function LinkHistory() {
  const [links, setLinks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const location = useLocation();

  // Mostrar toasts en base a la navegación anterior
  useEffect(() => {
    const {
      fromCancel,
      fromCancelError,
      fromCash,
      fromCashError,
    } = location.state || {};

    if (fromCancel) toast.success('Link cancelado correctamente.');
    if (fromCancelError) toast.error('No se pudo cancelar el link.');
    if (fromCash) toast.success('Pago en efectivo registrado.');
    if (fromCashError) toast.error('No se pudo marcar como pagado.');

    if (fromCancel || fromCancelError || fromCash || fromCashError) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  useEffect(() => {
    const loadLinks = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, concept, status, amount, expiration_date, created_at, kueski_created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando links:', error.message);
        return;
      }

      setLinks(data || []);
    };

    loadLinks();
  }, []);

  useEffect(() => {
    const filteredData = links.filter((tx) => {
      const matchesSearch = (tx.concept || '')
        .toLowerCase()
        .includes(search.toLowerCase());

      const effectiveStatus = getEffectiveTransactionStatus(tx);
      const matchesStatus =
        statusFilter === 'all' ? true : effectiveStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFiltered(filteredData);
  }, [search, statusFilter, links]);

  const groupByDate = (transactions) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    return transactions.reduce((groups, tx) => {
      const dateStr = new Date(tx.created_at).toDateString();
      let label;

      if (dateStr === today) {
        label = 'Hoy';
      } else if (dateStr === yesterday) {
        label = 'Ayer';
      } else {
        label = format(new Date(tx.created_at), "d 'de' MMMM 'de' yyyy", { locale: es });
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
      return groups;
    }, {});
  };

  const grouped = groupByDate(filtered);

  return (
    <SubpageLayout title="Historial de links" fallbackPath="/options">
      <h1>Historial de links con Kueski</h1>

      <input
        type="text"
        placeholder="Buscar por concepto"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.searchInput}
      />

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className={styles.sortSelect}
      >
        <option value="all">Todos los estados</option>
        <option value="approved">Pagado</option>
        <option value="pagado_efectivo">Pagado en efectivo</option>
        <option value="pendiente">Pendiente</option>
        <option value="pendiente_efectivo">Pendiente en efectivo</option>
        <option value="canceled">Cancelado</option>
        <option value="denied">Rechazado</option>
        <option value="expired">Vencido</option>
        <option value="kueski_expired">Link Kueski expirado</option>
      </select>

      <div className={styles['links-container']}>
        {Object.entries(grouped).length === 0 ? (
          <p>No hay resultados.</p>
        ) : (
          Object.entries(grouped).map(([dateLabel, txs]) => (
            <div key={dateLabel}>
              <h3 className={styles.dateLabel}>{dateLabel}</h3>
              {txs.map((link) => {
                const status = getStatusDisplay(link);
                return (
                  <div key={link.id}>
                    <div
                      onClick={() => navigate(`/link-info/${link.id}`)}
                      className={styles.link}
                    >
                      <div className={status.style}>
                        {typeof status.icon === 'string' ? (
                          <img
                            className={styles['status-icon']}
                            src={status.icon}
                            alt={status.label}
                          />
                        ) : (
                          status.icon
                        )}
                      </div>
                      <div className={styles['link-body']}>
                        <div className={styles['link-title']}>
                          {link.concept || 'Sin título'}
                        </div>
                        <div className={styles['link-subtext']}>{status.label}</div>
                        <div className={styles['link-subtext']}>
                          {formatMoney(link.amount)}
                        </div>
                      </div>
                    </div>
                    <hr />
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

export default LinkHistory;
