// src/menu/EmployeeInfo.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import SubpageLayout from '../layouts/SubpageLayout';
import styles from '../styles/menu/EmployeeInfo.module.css';

export default function EmployeeInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '', active: true });

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        navigate('/employees', {
          replace: true,
          state: { fromEmployeeError: true }
        });
        return;
      }

      setEmployee(data);
      setForm({
        name: data.name || '',
        phone: data.phone || '',
        active: data.active
      });
      setLoading(false);
    };

    fetchEmployee();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? Boolean(checked) : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error, data } = await supabase
      .from('users')
      .update({
        name: form.name,
        phone: form.phone,
        active: form.active,
      })
      .eq('id', id)
      .select();

    console.log('Resultado de update:', { data, error });

    if (error) {
      toast.error('Error al guardar los cambios');
    } else {
      toast.success('Cambios guardados');
      setEmployee((prev) => ({ ...prev, ...form }));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setConfirmDelete(false);

    if (!id) {
      toast.error('ID inválido');
      return;
    }

    try {
      const res = await fetch(`/api/delete-employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: id })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al eliminar');

      navigate('/employees', {
        state: { fromEmployeeDeleted: true },
        replace: true
      });
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <SubpageLayout title="Detalle del empleado">
        <p>Cargando...</p>
      </SubpageLayout>
    );
  }

  return (
    <SubpageLayout title="Editar empleado" fallbackPath="/employees">
      <div className={styles.container}>
        <h1>Editar empleado</h1>

        <div>
          <label className={styles.label}>Nombre:</label>
          <input
            type="text"
            name="name"
            className={styles.input}
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className={styles.label}>Correo:</label>
          <input
            type="text"
            className={styles.input}
            value={employee.email}
            disabled
          />
        </div>

        <div>
          <label className={styles.label}>Teléfono:</label>
          <input
            type="text"
            name="phone"
            className={styles.input}
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className={styles.checkboxWrapper}>
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
          />
          <label>Empleado activo</label>
        </div>

        <div className={styles['background-add-button']}>
          <button
            onClick={handleSave}
            disabled={saving}
            className={styles.button}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className={`${styles.button} ${styles.dangerButton}`}
            >
              Eliminar empleado
            </button>
          ) : (
            <div className={styles.confirmation}>
              <p>¿Seguro que deseas eliminar permanentemente este empleado?</p>
              <button
                onClick={handleDelete}
                className={`${styles.button} ${styles.dangerButton}`}
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className={styles.button}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </SubpageLayout>
  );
}
