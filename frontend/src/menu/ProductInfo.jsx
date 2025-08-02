// src/menu/ProductInfo.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import SubpageLayout from '../layouts/SubpageLayout';
import styles from '../styles/menu/ProductInfo.module.css';
import defaultImage from '../assets/avatar.svg';
import { formatMoney } from '../lib/formatters';

function ProductInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    type: 'Producto',
    status: 'active',
  });
  const [imagePath, setImagePath] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        toast.error('Producto no encontrado');
        navigate('/products');
        return;
      }

      setProduct(data);
      setForm({
        name: data.name || '',
        description: data.description || '',
        price: formatMoney(data.price || 0),
        type: data.type || 'Producto',
        status: data.status || 'active',
      });
      setImagePath(data.image_path || null);
      setLoading(false);
    };

    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? (checked ? 'active' : 'inactive') : value,
    }));
  };

  const handlePriceChange = (e) => {
    formatMoney(e); // modifica e.target.value visualmente
    setForm((prev) => ({
      ...prev,
      price: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes JPG, PNG o WEBP');
      return;
    }

    if (file.size > maxSize) {
      toast.warn('La imagen debe pesar menos de 2MB');
      return;
    }

    setNewImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    const rawPrice = form.price.replace(/[^0-9.]/g, '');
    const price = parseFloat(rawPrice);

    const { error: updateError } = await supabase
      .from('products')
      .update({
        name: form.name,
        description: form.description,
        price,
        type: form.type,
        status: form.status,
      })
      .eq('id', id);

    if (updateError) {
      toast.error('Error al guardar los cambios');
      setSaving(false);
      return;
    }

    if (newImageFile) {
      const newPath = `products/${id}/${Date.now()}_${newImageFile.name}`;
      const { error: uploadError } = await supabase
        .storage
        .from('kueskilink')
        .upload(newPath, newImageFile, { upsert: true });

      if (!uploadError) {
        await supabase
          .from('products')
          .update({ image_path: newPath })
          .eq('id', id);
        setImagePath(newPath);
        toast.success('Cambios guardados con nueva imagen');
      } else {
        toast.warn('Cambios guardados, pero hubo un error al subir la imagen');
      }
    } else {
      toast.success('Cambios guardados');
    }

    setSaving(false);
    setNewImageFile(null);
    setImagePreview(null);

    setTimeout(() => {
      navigate('/products');
    }, 200);
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    if (!id) {
      toast.error('ID inválido');
      return;
    }

    try {
      const res = await fetch(`/api/delete-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al eliminar');

      toast.success('Producto eliminado permanentemente');
      navigate('/products');
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const getImageUrl = () => {
    if (imagePreview) return imagePreview;
    if (imagePath)
      return supabase.storage.from('kueskilink').getPublicUrl(imagePath).data.publicUrl;
    return defaultImage;
  };

  if (loading) {
    return (
      <SubpageLayout title="Detalle del producto">
        <p>Cargando...</p>
      </SubpageLayout>
    );
  }

  return (
    <SubpageLayout title="Editar producto" fallbackPath="/products">
      <div className={styles.container}>
        <h1 className={styles.title}>Editar producto</h1>

        <label className={styles.label}>Nombre:</label>
        <input name="name" value={form.name} onChange={handleChange} className={styles.input} />

        <label className={styles.label}>Descripción:</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className={styles.inputDescription}
        />

        <label className={styles.label}>Precio:</label>
        <input
          type="text"
          name="price"
          value={form.price}
          onChange={handlePriceChange}
          className={styles.input}
        />

        <label className={styles.label}>Categoría:</label>
        <select name="type" value={form.type} onChange={handleChange} className={styles.input}>
          <option value="Producto">Producto</option>
          <option value="Servicio">Servicio</option>
          <option value="Otro">Otro</option>
        </select>

        <div className={styles.checkboxWrapper}>
          <input
            type="checkbox"
            name="status"
            checked={form.status === 'active'}
            onChange={handleChange}
          />
          <label>Producto activo</label>
        </div>

        <span className={styles.label}>Imagen del producto</span>
        <div className={styles.avatarContainer}>
          <img src={getImageUrl()} alt="Imagen del producto" className={styles.avatarImg} />
          <label className={styles.addPhotoBtn} htmlFor="product-image-upload">
            +
            <input
              ref={fileInputRef}
              id="product-image-upload"
              type="file"
              accept="image/jpeg, image/png, image/webp"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
          </label>
        </div>

        <div className={styles.backgroundAddButton}>
          <button onClick={handleSave} disabled={saving} className={styles.button}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className={`${styles.button} ${styles.dangerButton}`}
            >
              Eliminar producto
            </button>
          ) : (
            <div className={styles.confirmation}>
              <p>¿Seguro que deseas eliminar permanentemente este producto?</p>
              <button onClick={handleDelete} className={`${styles.button} ${styles.dangerButton}`}>
                Sí, eliminar
              </button>
              <button onClick={() => setConfirmDelete(false)} className={styles.button}>
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </SubpageLayout>
  );
}

export default ProductInfo;
