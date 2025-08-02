// src/links/ProductList.jsx
import ProductItem from './ProductItem';
import styles from '../styles/links/CreateLink.module.css';
import { formatMoney, formatQTY } from '../lib/formatters';

function ProductList({ products, onEdit, onRemove, editIndex }) {
  if (!products || products.length === 0) {
    return <p className={styles.label}>No has agregado productos aún</p>;
  }

  return (
    <div className={styles.productsContainer}>
      {products.map((product, index) => {
        const formattedProduct = {
          ...product,
          priceFormatted: formatMoney(product.price),
          quantityFormatted: formatQTY(product.quantity),
          totalFormatted: formatMoney(product.price * product.quantity),
        };

        return (
          <ProductItem
            key={index}
            product={formattedProduct}
            index={index}
            onEdit={onEdit}
            onRemove={onRemove}
            isEditing={editIndex === index}
          />
        );
      })}
    </div>
  );
}

export default ProductList;
