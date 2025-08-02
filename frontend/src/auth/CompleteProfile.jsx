// src/auth/CompleteProfile.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useAuthActions } from '../hooks/useAuthActions';
import { supabase } from '../lib/supabase';
import styles from '../styles/auth/CompleteProfile.module.css';
import editIcon from '../assets/edit.svg';
import avatar from '../assets/avatar.svg';

function CompleteProfile() {
  const { user, profile, loading, refreshProfile } = useUser();
  const { completeProfile } = useAuthActions();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [invitation, setInvitation] = useState(null);

  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const logoInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (loading) return;

    if (token && user && !profile) return;

    if (user && profile) {
      navigate(profile.role === 'owner' ? '/admin' : '/employee', { replace: true });
    }
  }, [user, profile, loading, navigate, searchParams]);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;

    const fetchInvitation = async () => {
      const { data, error } = await supabase
        .from('employee_invitations')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single();

      if (!error && data) {
        setInvitation(data);
        if (data.name) setName(data.name);
      } else {
        setError('Invitación inválida o ya utilizada.');
      }
    };

    fetchInvitation();
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFormLoading(true);

    const payload = {
      name,
      phone,
      businessName: invitation ? null : businessName,
      logoFile: invitation ? null : logoFile,
      token: invitation?.token || null,
    };

    const { success, error: completeError } = await completeProfile(payload);

    if (!success) {
      setError('No se pudo completar tu perfil.');
      setFormLoading(false);
      return;
    }

    await refreshProfile();
    navigate(invitation ? '/employee' : '/admin');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError('Sólo se permiten imágenes JPG, PNG o WEBP.');
      return;
    }

    if (file.size > maxSize) {
      setError('La imagen debe pesar menos de 2MB.');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError(null);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.logo}>Kueski <span style={{ color: '#3366FF' }}>Link</span></h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        {!invitation && (
          <>
            <h1>Completa tu perfil</h1>
            <div className={styles.field}>
              <span className={styles.label}>Nombre del negocio</span>
              <input
                className={styles.input}
                name="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={formLoading}
                placeholder="Ej. Zapatería Roma"
              />
            </div>
            <hr className={styles.divider} />
          </>
        )}

        <div className={styles.field}>
          <span className={styles.label}>Nombre</span>
          <div className={styles.inputWrapper}>
            <input
              ref={nameRef}
              className={styles.input}
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={formLoading}
              placeholder="Ej. Juan Pérez"
            />
            <img
              src={editIcon}
              alt="edit"
              className={styles.inputIcon}
              onClick={() => nameRef.current?.focus()}
            />
          </div>
        </div>
        <hr className={styles.divider} />

        <div className={styles.field}>
          <span className={styles.label}>Teléfono</span>
          <div className={styles.inputWrapper}>
            <input
              ref={phoneRef}
              className={styles.input}
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={formLoading}
              placeholder="Teléfono"
            />
            <img
              src={editIcon}
              alt="edit"
              className={styles.inputIcon}
              onClick={() => phoneRef.current?.focus()}
            />
          </div>
        </div>
        <hr className={styles.divider} />

        {!invitation && (
          <>
            <div className={styles.field}>
              <span className={styles.label}>Selecciona el logo de tu empresa (opcional)</span>
            </div>
            <div className={styles.avatarContainer}>
              <img
                src={
                  logoPreview
                    ? logoPreview
                    : avatar
                }
                alt="Vista previa del logo"
                className={styles.avatarImg}
              />
              <label className={styles.addPhotoBtn} htmlFor="logo-upload">
                +
                <input
                  ref={logoInputRef}
                  id="logo-upload"
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={styles.saveBtn}
          disabled={formLoading}
        >
          {formLoading ? 'Guardando...' : 'Guardar y continuar'}
        </button>
      </form>
    </div>
  );
}

export default CompleteProfile;
