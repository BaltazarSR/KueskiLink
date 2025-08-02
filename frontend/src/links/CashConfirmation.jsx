// src/links/CashConfirmation.jsx
import { Link } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout';
import styles from '../styles/links/CashConfirmation.module.css'

export default function CashConfirmation() {
  return (
    <PublicLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>Pago en efectivo registrado</h1>
        <p className={styles.message}>
          Tu pago ha sido registrado como <strong>en efectivo</strong>.
        </p>
        <p className={styles.message}>
          Por favor realiza el pago directamente en el negocio para completar tu compra.
        </p>
        <p className={styles.message}>
          El vendedor actualizará el estado de tu pago una vez recibido.
        </p>
        <Link to="/" className={styles.backButton}>Volver al inicio</Link>
      </div>
    </PublicLayout>
  )
}
