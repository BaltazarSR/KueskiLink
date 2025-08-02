// src/links/SummarySection.jsx
import styles from '../styles/links/CreateLink.module.css';
import { formatMoney } from '../lib/formatters';

function SummarySection({
  products,
  concept,
  noteToClient,
  errors,
  onConceptChange,
  onNoteChange,
  onClear,
  onSubmit,
}) {
  const total = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);

  return (
    <>
      {/* Total */}
      <div className={styles.totalContainer}>
        <label className={styles.label}>Total de la venta</label>
        <p className={styles.totalAmount}>{formatMoney(total)}</p>
      </div>

      {/* Concepto */}
      <div>
        <label htmlFor="concept" className={styles.label}>Concepto (obligatorio):</label>
        <div className={`${styles.inputWrapper} ${errors.concept ? styles.inputError : ''}`}>
          <input
            id="concept"
            className={styles.input}
            type="text"
            placeholder="Pon aquí el concepto del pago"
            value={concept}
            onChange={(e) => onConceptChange(e.target.value)}
          />
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => onClear('concept')}
          >
            ×
          </button>
        </div>
      </div>

      {/* Nota para cliente */}
      <div>
        <label htmlFor="note-to-client" className={styles.label}>Nota para el cliente:</label>
        <div className={styles.inputWrapper}>
          <textarea
            id="note-to-client"
            className={styles.inputDescription}
            placeholder="Texto visible para el cliente"
            value={noteToClient}
            onChange={(e) => onNoteChange(e.target.value)}
          ></textarea>
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => onClear('note-to-client')}
          >
            ×
          </button>
        </div>
      </div>

      {/* Botón generar link */}
      <div className={styles.backgroundCreateButton}>
        <button
          type="submit"
          className={styles.button}
          onClick={onSubmit}
          disabled={products.length === 0}
        >
          Generar link de pago
        </button>
      </div>
    </>
  );
}

export default SummarySection;
