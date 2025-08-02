// src/payment/Failed.jsx
import styles from "../styles/payment/Failed.module.css";
import PublicLayout from '../layouts/PublicLayout';

export default function Failed() {
  return (
    <PublicLayout title="Error en el pago">
      <div className={styles.container}>
        <h1 className={styles.title}>Error al procesar el pago</h1>
        <p className={styles.message}>
          Ocurrió un problema técnico durante el proceso de pago.
        </p>
        <p className={styles.subMessage}>
          Por favor, intenta nuevamente más tarde o contacta al negocio para asistencia.
        </p>
        <div className={styles.iconError}>!</div>
      </div>
    </PublicLayout>
  );
}
