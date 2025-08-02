// src/links/ClientPay.jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import CompanyIcon from '../assets/company.svg';
import ProductIcon from '../assets/product.svg';
import styles from '../styles/links/ClientPay.module.css';
import ReadOnlyProductItem from '../components/ReadOnlyProductItem';
import { formatMoney } from '../lib/formatters';
import PublicLayout from '../layouts/PublicLayout';
import { getPublicUrl } from '../lib/supabaseUtils';

export default function ClientPay() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const [products, setProducts] = useState([]);
  const [company, setCompany] = useState({ name: '', logo_path: null });

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [customerRequest, setCustomerRequest] = useState('');

  const clearInput = (setter) => setter('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/get-transaction?id=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error('Transacción no encontrada');
        const { transaction, products, company } = await res.json();
        setTransaction(transaction);
        setProducts(products);
        setCompany(company);
        setCustomerRequest(transaction.customer_request || '');
      } catch (err) {
        console.error(err);
        toast.error('Transacción no encontrada.');
        setTransaction(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleKueskiPayment = async () => {
    if(transaction.amount < 500) {
      toast.error('El monto mínimo para pagar con Kueski es $500');
      return;
    } 
    if(transaction.amount >  20000) {
      toast.error('El monto máximo para pagar con Kueski es $20,000');
      return;
    } 
    if (!clientName || !clientEmail || !clientPhone) {
      toast.error('Por favor completa tus datos antes de continuar.');
      return;
    }
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: id,
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          customerRequest
        })
      });
      const json = await res.json();
      if (json.status === 'success') {
        window.location.href = json.data.callback_url;
      } else {
        console.error(json);
        toast.error('Error al conectar con Kueski');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red');
    }
  };

  const handleCashPayment = async () => {
    if (!clientName || !clientEmail || !clientPhone) {
      toast.error('Por favor completa tus datos antes de continuar.');
      return;
    }

    try {
      const res = await fetch('/api/pay-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: id,
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          customerRequest
        })
      });
      const json = await res.json();
      if (res.ok) {
        window.location.href = `/cash-confirmation`;
      } else {
        console.error(json);
        toast.error(json.error || 'Ocurrió un error');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red');
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <p className={styles.loading}>Cargando…</p>
      </PublicLayout>
    );
  }

  if (!transaction) {
    return (
      <PublicLayout>
        <p className={styles.error}>Transacción no encontrada.</p>
      </PublicLayout>
    );
  }

  const isPending = transaction.status === 'pendiente';

  return (
    <PublicLayout>
      <div className={styles['form-container']}>
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Descripción de pago */}
          <section className={styles['payment-info']}>
            <h1>Descripción de pago para:</h1>
            <div className={styles['company-details']}>
              <img
                src={
                  company.logo_path
                    ? getPublicUrl(company.logo_path)
                    : CompanyIcon
                }
                alt={company.name || 'Logo'}
                className={styles['company-logo']}
              />
              <span className={styles['company-name']}>
                {company.name || 'Negocio'}
              </span>
            </div>
          </section>

          <hr />

          {/* Lista de productos */}
          <section className={styles['product-list']}>
            <h2 className={styles['section-title']}>Lista de productos</h2>
            {products.map((item, i) => (
              <ReadOnlyProductItem key={i} item={item} />
            ))}
          </section>

          {/* Total */}
          <section className={styles['payment-total']}>
            <h2 className={styles['section-title']}>Total a pagar</h2>
            <div className={styles.amount}>
              {formatMoney(transaction.amount)}
            </div>
          </section>

          <hr />

          {/* Nota del comercio */}
          {transaction.note_to_client && (
            <>
              <div className={styles['note-to-client']}>
                <h3 className={styles['note-title']}>
                  Mensaje del comercio
                </h3>
                <p className={styles.note}>
                  {transaction.note_to_client}
                </p>
              </div>
              <hr />
            </>
          )}

          {/* Inputs de cliente */}
          <h2 className={styles['section-title']}>
            Ingresa tus datos para pagar
          </h2>

          <div className={styles['input-group']}>
            <label htmlFor="name" className={styles.labels}>
              Nombre Completo
            </label>
            <div className={styles['input-wrapper']}>
              <input
                id="name"
                type="text"
                className={styles['input-style']}
                placeholder="Ej. Juan Pérez"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
              <button
                type="button"
                className={styles['clear-button']}
                onClick={() => clearInput(setClientName)}
              >
                ×
              </button>
            </div>
          </div>

          <div className={styles['input-group']}>
            <label htmlFor="email" className={styles.labels}>
              Correo electrónico
            </label>
            <div className={styles['input-wrapper']}>
              <input
                id="email"
                type="email"
                className={styles['input-style']}
                placeholder="Ej. correo@dominio.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
              <button
                type="button"
                className={styles['clear-button']}
                onClick={() => clearInput(setClientEmail)}
              >
                ×
              </button>
            </div>
          </div>

          <div className={styles['input-group']}>
            <label htmlFor="phone" className={styles.labels}>
              Número de teléfono
            </label>
            <div className={styles['input-wrapper']}>
              <input
                id="phone"
                type="tel"
                className={styles['input-style']}
                placeholder="Ej. 5512345678"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
              <button
                type="button"
                className={styles['clear-button']}
                onClick={() => clearInput(setClientPhone)}
              >
                ×
              </button>
            </div>
          </div>

          <div className={styles['input-group']}>
            <label htmlFor="customerRequest" className={styles.labels}>
              Nota para el comercio{' '}
              <span className={styles.optional}>(opcional)</span>
            </label>
            <div className={styles['input-wrapper']}>
              <textarea
                id="customerRequest"
                className={styles['textarea-style']}
                placeholder="Ej. Por favor entregar después de las 6pm"
                value={customerRequest}
                onChange={(e) => setCustomerRequest(e.target.value)}
              />
              <button
                type="button"
                className={styles['clear-button']}
                onClick={() => clearInput(setCustomerRequest)}
              >
                ×
              </button>
            </div>
          </div>

          {/* Botones de pago */}
          {isPending ? (
            <div className={styles['payment-buttons']}>
              <button
                type="button"
                className={styles['pay-general-button']}
                onClick={handleCashPayment}
              >
                Pagar en efectivo
              </button>
              <button
                type="button"
                className={styles['pay-kueski-button']}
                onClick={handleKueskiPayment}
              >
                Pagar con Kueski
              </button>
            </div>
          ) : (
            <p className={styles.message}>
              Esta transacción ya no está disponible para realizar pagos.
            </p>
          )}
        </form>
      </div>
    </PublicLayout>
  );
}
