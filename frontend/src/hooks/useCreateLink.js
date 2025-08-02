//src/hooks/useCreateLink.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { formatMoney, formatQTY } from '../lib/formatters';


export function useCreateLink() {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [includedProducts, setIncludedProducts] = useState([]);
  const [description, setDescription] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [concept, setConcept] = useState('');
  const [noteToClient, setNoteToClient] = useState('');
  const [errors, setErrors] = useState({ products: false, concept: false });
  const [availableProducts, setAvailableProducts] = useState([]);

  const { profile } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile?.company?.id) return;
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', profile.company.id)
        .order('created_at', { ascending: false });

      if (error) console.error('Error al obtener productos:', error.message);
      else setAvailableProducts(data);
    };

    fetchProducts();
  }, [profile]);

  const clearInput = (id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
    switch (id) {
      case 'price':
        setPrice('');
        break;
      case 'description':
        setDescription('');
        break;
      case 'product':
        setSelectedProduct('');
        setSelectedProductId('');
        setPrice('');
        setDescription('');
        setQuantity(1);
        break;
      case 'quantity':
        setQuantity(1);
        break;
      default:
        break;
    }
  };

  const restrictInput = (event) => {
    const allowedKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", ".", "Enter"];
    const isNumber = /\d/.test(event.key);
    if (!isNumber && !allowedKeys.includes(event.key)) event.preventDefault();
    if (event.key === "." && event.target.value.includes(".")) event.preventDefault();
  };


  const handleAddProduct = () => {
    const trimmedName = selectedProduct.trim();
    const trimmedDescription = description.trim();
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    const qty = typeof quantity === 'string' ? parseFloat(quantity.replace(/,/g, '')) : quantity;

    if (!trimmedName || isNaN(numericPrice) || isNaN(qty) || qty <= 0) {
      return 'Debes ingresar nombre, precio válido y cantidad mayor a 0.'
    }

    const existing = availableProducts.find(p => p.id === selectedProductId);
    const newProduct = {
      name: trimmedName,
      description: trimmedDescription,
      price: numericPrice,
      quantity: qty,
      id: existing?.id || null,
      type: existing?.type || 'Otro'
    };

    setIncludedProducts(prev => {
      const updated = [...prev];
      if (editIndex !== null) updated[editIndex] = newProduct;
      else updated.push(newProduct);
      return updated;
    });

    setSelectedProduct('');
    setSelectedProductId('');
    setDescription('');
    setPrice('');
    setQuantity(1);
    setEditIndex(null);
  };

  const handleEditProduct = (index) => {
    const product = includedProducts[index];
    setSelectedProduct(product.name);
    setDescription(product.description || '');
    setPrice(formatMoney(product.price));
    setQuantity(product.quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    setSelectedProductId(product.id || '');
    setEditIndex(index);
  };

  const handleRemoveProduct = (indexToRemove) => {
    const confirmed = window.confirm('¿Estás seguro que quieres eliminar este producto?');
    if (!confirmed) return;
    setIncludedProducts(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = {
      products: includedProducts.length === 0,
      concept: concept.trim() === '',
    };

    setErrors(errs);
    if (errs.products || errs.concept) return;

    try {
      const nameSet = new Set();
      for (const p of includedProducts) {
        if (nameSet.has(p.name)) throw new Error(`Producto duplicado: "${p.name}"`);
        nameSet.add(p.name);
      }

      const amount = includedProducts.reduce((acc, p) => {
        const parsed = parseFloat(p.price);
        const qty = parseFloat(p.quantity);
        if (isNaN(parsed) || isNaN(qty)) throw new Error(`Precio o cantidad inválidos en "${p.name}"`);
        return acc + (parsed * qty);
      }, 0);

      const newProducts = includedProducts.filter(p => !p.id);
      const inserts = newProducts.map(p => ({
        name: p.name,
        description: p.description || '',
        price: p.price,
        company_id: profile.company.id,
        type: p.type || 'Otro',
        status: 'active'
      }));

      let insertedProducts = [];
      if (inserts.length > 0) {
        const { data, error } = await supabase
          .from('products')
          .insert(inserts)
          .select();
        if (error) throw new Error('Error al insertar productos: ' + error.message);
        insertedProducts = data;
      }

      const completeProducts = includedProducts.map(p => {
        if (p.id) return p;
        const match = insertedProducts.find(np => np.name === p.name && np.price === p.price);
        if (!match?.id) throw new Error(`No se pudo asignar ID al producto "${p.name}"`);
        return { ...p, id: match.id };
      });

      const transactionId = crypto.randomUUID();
      const paymentLink = `https://kueski-link.vercel.app/client-pay/${transactionId}`;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);

      const { error: txError } = await supabase.from('transactions').insert({
        id: transactionId,
        company_id: profile.company.id,
        user_id: profile.id,
        concept: concept.trim(),
        amount,
        payment_link: paymentLink,
        note_to_client: noteToClient || '',
        expiration_date: expirationDate.toISOString(),
      });

      if (txError) throw new Error('Error al insertar transacción: ' + txError.message);

      const ptInserts = completeProducts.map(p => ({
        transaction_id: transactionId,
        product_id: p.id,
        quantity: parseFloat(p.quantity),
        unit_price: p.price,
        description: p.description || '',
      }));

      const { error: ptError } = await supabase.from('products_transactions').insert(ptInserts);
      if (ptError) throw new Error('Error al insertar productos en transacción: ' + ptError.message);

      navigate('/send-link', {
        state: {
          paymentLink,
          transactionId,
          success: true, // <= esto es clave
        },
      });

    } catch (err) {
      throw err;
    }
  };

  return {
    selectedProduct,
    selectedProductId,
    showSuggestions,
    price,
    quantity,
    includedProducts,
    description,
    editIndex,
    concept,
    noteToClient,
    errors,
    availableProducts,

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
    handleAddProduct,
    handleEditProduct,
    handleRemoveProduct,
    handleSubmit,
    formatQTY,
  };
}
