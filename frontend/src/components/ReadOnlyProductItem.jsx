// src/components/ReadOnlyProductItem.jsx
import { useState } from 'react';
import modalStyles from '../styles/components/ReadOnlyProductItem.module.css';
import styles from '../styles/links/CreateLink.module.css';
import { formatMoney, formatQTY } from '../lib/formatters';
import { getPublicUrl } from '../lib/supabaseUtils';
import ProductIcon from '../assets/product.svg';
import { FaBoxOpen, FaTools, FaQuestionCircle } from 'react-icons/fa';

export default function ReadOnlyProductItem({ item }) {
  const [showModal, setShowModal] = useState(false);

  const quantityFormatted = formatQTY(item.quantity);
  const priceFormatted = formatMoney(item.unit_price);
  const totalFormatted = formatMoney(item.quantity * item.unit_price);

  const hasImage = !!item.products.image_path;
  const imageUrl = hasImage
    ? getPublicUrl(item.products.image_path)
    : null;

  const getIcon = (type) => {
    switch (type) {
      case 'Producto':
        return <FaBoxOpen size={24} color="#3366FF" />;
      case 'Servicio':
        return <FaTools size={24} color="#28a745" />;
      default:
        return <FaQuestionCircle size={24} color="#ffc107" />;
    }
  };

  return (
    <div>
      <div className={styles.product}>
        <div className={styles.productImg}>
          {hasImage ? (
            <img
              src={imageUrl}
              alt={item.products.name}
              className={styles['company-logo']}
              style={{
                width: 48,
                height: 48,
                borderRadius: 4,
                objectFit: 'cover',
                cursor: 'pointer'
              }}
              onClick={() => setShowModal(true)}
            />
          ) : (
            <div onClick={() => setShowModal(!!imageUrl)} style={{ cursor: 'default' }}>
              {getIcon(item.products.type)}
            </div>
          )}
        </div>

        <div className={styles.productBody}>
          <div className={styles.productTitle}>{item.products.name}</div>
          <div className={styles.productText}>
            {item.description || 'Sin descripción'}
          </div>
          <div className={styles.productText}>
            {quantityFormatted} x {priceFormatted} = {totalFormatted}
          </div>
        </div>
      </div>
      <hr />

      {hasImage && showModal && (
        <div className={modalStyles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img
              src={imageUrl}
              alt={item.products.name}
              className={modalStyles.modalImage}
            />
            <button
              className={modalStyles.modalCloseButton}
              onClick={() => setShowModal(false)}
            >
              Cerrar imagen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
