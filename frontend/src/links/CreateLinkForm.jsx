// src/links/CreateLinkForm.jsx
import styles from '../styles/links/CreateLink.module.css';
import ProductList from './ProductList';
import SummarySection from './SummarySection';
import { toast } from 'react-toastify'

function CreateLinkForm({
  selectedProduct,
  selectedProductId,
  showSuggestions,
  price,
  quantity,
  includedProducts,
  description,
  concept,
  noteToClient,
  errors,
  availableProducts,
  editIndex,

  setSelectedProduct,
  setSelectedProductId,
  setShowSuggestions,
  setPrice,
  setQuantity,
  setDescription,
  setConcept,
  setNoteToClient,
  setEditIndex,

  clearInput,
  restrictInput,
  formatMoney,
  formatQTY,
  handleAddProduct,
  handleEditProduct,
  handleRemoveProduct,
  handleSubmit
}) {
  const onAddClick = () => {
    const errorMsg = handleAddProduct();
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    // Limpiar campos solo si se agregó correctamente
    clearInput('product');
    clearInput('description');
    clearInput('price');
    clearInput('quantity');
    setEditIndex(null);
  };
  const onFinalSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleSubmit(e);
    } catch (err) {
      toast.error('Ocurrió un error al generar el link: ' + err.message);
    }
  };
  return (
    <div className={styles.container}>
      {/* Producto */}
      <div>
        <label className={styles.label}>Producto:</label>
        <div className={styles.inputWrapper}>
          <input
            id="product"
            type="text"
            className={styles.input}
            placeholder="Producto"
            value={selectedProduct}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedProduct(value);
              const match = availableProducts.find(p => p.name.toLowerCase() === value.toLowerCase());
              if (match) {
                setSelectedProductId(match.id);
                setPrice(formatMoney(match.price));
                setDescription(match.description || '');
              } else {
                setSelectedProductId('');
                setPrice('');
                setDescription('');
              }
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
          {showSuggestions && selectedProduct && (
            <ul className={styles.autocompleteList}>
              {availableProducts
                .filter(p => p.name.toLowerCase().includes(selectedProduct.toLowerCase()))
                .slice(0, 5)
                .map(p => (
                  <li
                    key={p.id}
                    className={styles.autocompleteItem}
                    onMouseDown={() => {
                      setSelectedProduct(p.name);
                      setSelectedProductId(p.id);
                      setPrice(formatMoney(p.price));
                      setDescription(p.description || '');
                      setShowSuggestions(false);
                    }}
                  >
                    {p.name}
                  </li>
                ))}
            </ul>
          )}
          <button type="button" className={styles.clearButton} onClick={() => clearInput('product')}>×</button>
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className={styles.label}>Descripción:</label>
        <div className={styles.inputWrapper}>
          <textarea
            id="description"
            className={styles.inputDescription}
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <button type="button" className={styles.clearButton} onClick={() => clearInput('description')}>×</button>
        </div>
      </div>

      {/* Precio */}
      <div>
        <label className={styles.label}>Precio unitario:</label>
        <div className={styles.inputWrapper}>
          <input
            id="price"
            className={styles.input}
            type="text"
            placeholder="$30"
            value={price}
            onInput={(e) => setPrice(formatMoney(e))}
            onKeyDown={restrictInput}
          />
          <button type="button" className={styles.clearButton} onClick={() => clearInput('price')}>×</button>
        </div>
      </div>

      {/* Cantidad */}
      <div>
        <label className={styles.label}>Cantidad:</label>
        <div className={styles.inputWrapper}>
          <input
            id="quantity"
            type="text"
            placeholder="Ej. 1 o 1.5"
            className={styles.input}
            value={quantity}
            onChange={(e) => setQuantity(formatQTY(e))}
          />
          <button type="button" className={styles.clearButton} onClick={() => clearInput('quantity')}>×</button>
        </div>
      </div>

      {/* Botón agregar o actualizar */}
      <div>
        <button type="button" className={styles.button} onClick={onAddClick}>
          {editIndex !== null ? 'Actualizar producto' : 'Agregar producto'}
        </button>
        {editIndex !== null && (
          <button
            type="button"
            className={styles.button}
            style={{ marginTop: '0.5rem', backgroundColor: '#888' }}
            onClick={() => {
              setEditIndex(null);
              clearInput('product');
              clearInput('description');
              clearInput('price');
              clearInput('quantity');
            }}
          >
            Cancelar edición
          </button>
        )}
      </div>

      {/* Lista de productos */}
      <p className={styles.label}>Lista de productos:</p>
      <div className={styles.productsWrapper}>
        <ProductList
          products={includedProducts}
          onEdit={handleEditProduct}
          onRemove={handleRemoveProduct}
          editIndex={editIndex}
        />
      </div>

      {/* Sección resumen */}
      <SummarySection
        products={includedProducts}
        concept={concept}
        noteToClient={noteToClient}
        errors={errors}
        onConceptChange={setConcept}
        onNoteChange={setNoteToClient}
        onClear={clearInput}
        onSubmit={onFinalSubmit} 
      />
    </div>
  );
}

export default CreateLinkForm;
