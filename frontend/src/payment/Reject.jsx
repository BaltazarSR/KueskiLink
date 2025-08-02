// src/payment/Reject.jsx
import styles from "../styles/payment/Reject.module.css";
import PublicLayout from '../layouts/PublicLayout';

export default function Reject() {
  return (
    <PublicLayout title="Pago rechazado">
      <div className={styles.container}>
        <h1 className={styles.title}>Pago rechazado</h1>
        <p className={styles.message}>
          Tu pago no pudo ser procesado con Kueski. 
        </p>
        <p className={styles.subMessage}>
          Contacta al negocio para volver a generar la compra y elige otro método de pago.
        </p>
        <div className={styles.iconFail}>✕</div>
      </div>
    </PublicLayout>
  );
}
