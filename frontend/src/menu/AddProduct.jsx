// src/menu/AddProduct.jsx

import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../styles/menu/AddProduct.module.css';
import SubpageLayout from '../layouts/SubpageLayout';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import defaultIcon from '../assets/avatar.svg';
import { formatMoney } from '../lib/formatters';
import {useNavigate } from 'react-router-dom';

function AddProduct() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    type: 'Producto',
    status: 'active',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);
  const { profile } = useUser();
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? (checked ? 'active' : 'inactive') : value,
    }));
  };

  const handlePriceChange = (e) => {
    formatMoney(e); // modifica e.target.value directamente
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

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setSaving(true);

    const rawPrice = form.price.replace(/[^0-9.]/g, '');
    const price = parseFloat(rawPrice);

    if (!profile?.company?.id || !form.name || !form.type || isNaN(price)) {
      toast.error('Por favor llena todos los campos correctamente.');
      setSaving(false);
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from('products')
      .insert([{
        name: form.name,
        description: form.description,
        price,
        type: form.type,
        status: form.status,
        company_id: profile.company.id,
        image_path: null,
      }])
      .select('id')
      .single();

    if (insertError || !inserted?.id) {
      toast.error('Error al agregar producto: ' + insertError.message);
      setSaving(false);
      return;
    }

    if (imageFile) {
      const path = `products/${inserted.id}/${Date.now()}_${imageFile.name}`;
      const { error: uploadError } = await supabase
        .storage
        .from('kueskilink')
        .upload(path, imageFile, { upsert: true });

      if (!uploadError) {
        await supabase
          .from('products')
          .update({ image_path: path })
          .eq('id', inserted.id);
      } else {
        toast.warn('Producto guardado, pero hubo un error al subir la imagen.');
      }
    }

    toast.success('Producto agregado exitosamente.');
    setForm({ name: '', description: '', price: '', type: 'Producto', status: 'active' });
    setImageFile(null);
    setImagePreview(null);
    setSaving(false);

    setTimeout(() => {
      navigate('/products');
    }, 200);
  };

  return (
    <SubpageLayout title="Agregar producto" fallbackPath="/products">
      <div className={styles.container}>
        <h1>Agregar producto</h1>

        <label className={styles.label}>Nombre:</label>
        <input name="name" value={form.name} onChange={handleChange} className={styles.input} />

        <label className={styles.label}>Descripción:</label>
        <textarea name="description" value={form.description} onChange={handleChange} className={styles.inputDescription} />

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
          <input type="checkbox" name="status" checked={form.status === 'active'} onChange={handleChange} />
          <label>Producto activo</label>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Selecciona imagen del producto (opcional)</span>
        </div>
        <div className={styles.avatarContainer}>
          <img
            src={imagePreview || defaultIcon}
            alt="Vista previa del producto"
            className={styles.avatarImg}
          />
          <label htmlFor="product-image-upload" className={styles.addPhotoBtn}>
            +
            <input
              id="product-image-upload"
              type="file"
              accept="image/jpeg, image/png, image/webp"
              style={{ display: 'none' }}
              ref={imageInputRef}
              onChange={handleImageChange}
            />
          </label>
        </div>

        <div className={styles.backgroundAddButton}>
          <button onClick={handleSubmit} disabled={saving} className={styles.button}>
            {saving ? 'Guardando...' : 'Agregar producto'}
          </button>
        </div>
      </div>
    </SubpageLayout>
  );
}

export default AddProduct;
