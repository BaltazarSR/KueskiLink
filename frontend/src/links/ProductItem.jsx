// src/links/ProductItem.jsx
import styles from '../styles/links/CreateLink.module.css';
import editIcon from '../assets/edit.svg';
import { FaBoxOpen, FaTools, FaQuestionCircle } from 'react-icons/fa';

function ProductItem({ product, index, onEdit, onRemove, isEditing }) {
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
          {getIcon(product.type)}
        </div>
        <div className={styles.productBody}>
          <div className={styles.productTitle}>{product.name}</div>
          <div className={styles.productText}>
            {product.description || 'Sin descripción'}
          </div>
          <div className={styles.productText}>
            {product.quantityFormatted} x {product.priceFormatted} = {product.totalFormatted}
          </div>
        </div>

        {!isEditing && (
          <div className={styles.productButtons}>
            <button
              className={styles.productEditButton}
              title="Editar"
              onClick={() => onEdit(index)}
            >
              <img className={styles.editIcon} src={editIcon} alt="edit" />
            </button>
            <button
              className={styles.productEditButton}
              title="Eliminar"
              onClick={() => onRemove(index)}
            >
              ❌
            </button>
          </div>
        )}
      </div>
      <hr />
    </div>
  );
}

export default ProductItem;
