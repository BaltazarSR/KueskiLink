//src/payment/Success.jsx
import styles from "../styles/payment/Success.module.css";
import PublicLayout from '../layouts/PublicLayout';

export default function Success() {
  return (
    <PublicLayout title="Pago exitoso">
      <div className={styles.container}>
          <h1 className={styles.title}>¡Pago completado!</h1>
          <p className={styles.message}>
            Tu pago ha sido procesado exitosamente. Gracias por usar KueskiLink.
          </p>
          <p className={styles.subMessage}>
            Consulta con el negocio los siguientes pasos para tu compra.
          </p>
          <div className={styles.iconSuccess}>✓</div>
      </div>
    </PublicLayout>
  );
}