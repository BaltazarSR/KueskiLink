// src/payment/Canceled.jsx
import styles from "../styles/payment/Canceled.module.css";
import PublicLayout from '../layouts/PublicLayout';

export default function Canceled() {
  return (
    <PublicLayout title="Pago cancelado">
      <div className={styles.container}>
        <h1 className={styles.title}>Pago cancelado</h1>
        <p className={styles.message}>
          Has cancelado el proceso de pago.
        </p>
        <p className={styles.subMessage}>
          Si deseas hacer la compra, contacta al negocio para que te genere un nuevo link de pago.
        </p>
        <div className={styles.iconCanceled}>!</div>
      </div>
    </PublicLayout>
  );
}
