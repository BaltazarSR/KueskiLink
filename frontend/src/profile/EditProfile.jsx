// src/profile/EditProfile.jsx
import SubpageLayout from "../layouts/SubpageLayout";
import styles from "../styles/profile/EditProfile.module.css";
import editIcon from "../assets/edit.svg";
import avatar from "../assets/avatar.svg";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/UserContext";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function EditProfile() {
  const { profile, refreshProfile } = useUser();
  const [userData, setUserData] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar_path: null,
  });
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const navigate = useNavigate();

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (!profile?.company?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", profile.id)
        .single();
      if (error) {
        console.error("Error al obtener perfil:", error.message);
        toast.error("No pudimos cargar tu perfil.");
      } else {
        setUserData(data);
      }
    })();
  }, [profile]);

  useEffect(() => {
    if (userData) {
      setEditData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        avatar_path: userData.avatar_path || null,
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSave = async () => {
    // 1) Validación de correo
    if (!validateEmail(editData.email)) {
      toast.error("Por favor ingresa un correo válido.");
      return;
    }

    // 2) Preparar avatar_path
    let avatarPath = userData?.avatar_path;
    if (pendingAvatarFile) {
      const filePath = `avatars/${profile.id}/${Date.now()}_${pendingAvatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("kueskilink")
        .upload(filePath, pendingAvatarFile, { upsert: true });
      if (uploadError) {
        toast.error("Error al subir la imagen.");
        return;
      }
      avatarPath = filePath;
    }

    // 3) Guardar cambios en la tabla users
    const { error: updateError } = await supabase
      .from("users")
      .update({
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        avatar_path: avatarPath,
      })
      .eq("id", profile.id);
    if (updateError) {
      toast.error("Error al guardar cambios.");
      return;
    }

    // 4) Borrar avatar anterior si cambió
    const prev = userData?.avatar_path;
    if (prev && avatarPath && prev !== avatarPath) {
      await supabase.storage.from("kueskilink").remove([prev]);
    }

    // 5) Refrescar contexto y limpiar estado local
    await refreshProfile();
    setUserData({ ...editData, avatar_path: avatarPath });
    setPendingAvatarFile(null);

    // 6) En lugar de toast aquí, redirigimos a /profile y allí mostraremos el mensaje
    navigate("/profile?updated=profile", { replace: true });
  };

  const isChanged = () => {
    if (!userData) return false;
    return (
      editData.name !== (userData.name || "") ||
      editData.email !== (userData.email || "") ||
      editData.phone !== (userData.phone || "") ||
      editData.avatar_path !== (userData.avatar_path || null)
    );
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const max = 2 * 1024 * 1024;
    if (!allowed.includes(file.type)) {
      toast.error("Sólo se permiten imágenes JPG, PNG o WEBP.");
      return;
    }
    if (file.size > max) {
      toast.warn("La imagen debe pesar menos de 2MB.");
      return;
    }
    setPendingAvatarFile(file);
    setEditData({
      ...editData,
      avatar_path: URL.createObjectURL(file),
    });
  };

  return (
    <SubpageLayout>
      <div className={styles.container}>
        <h1>Edita tu perfil</h1>

        {/* Nombre */}
        <div className={styles.field}>
          <span className={styles.label}>Nombre</span>
          <div className={styles.inputWrapper}>
            <input
              ref={nameRef}
              name="name"
              value={editData.name}
              onChange={handleChange}
              className={styles.input}
              placeholder="Nombre"
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

        {/* Correo */}
        <div className={styles.field}>
          <span className={styles.label}>Correo</span>
          <div className={styles.inputWrapper}>
            <input
              ref={emailRef}
              name="email"
              type="email"
              value={editData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="Correo"
            />
            <img
              src={editIcon}
              alt="edit"
              className={styles.inputIcon}
              onClick={() => emailRef.current?.focus()}
            />
          </div>
        </div>
        <hr className={styles.divider} />

        {/* Teléfono */}
        <div className={styles.field}>
          <span className={styles.label}>Teléfono</span>
          <div className={styles.inputWrapper}>
            <input
              ref={phoneRef}
              name="phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={editData.phone}
              onChange={handleChange}
              className={styles.input}
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

        {/* Avatar */}
        <div className={styles.field}>
          <span className={styles.label}>Selecciona tu foto de perfil</span>
        </div>
        <div className={styles.avatarContainer}>
          <img
            src={
              pendingAvatarFile
                ? editData.avatar_path
                : editData.avatar_path
                ? supabase.storage
                    .from("kueskilink")
                    .getPublicUrl(editData.avatar_path).data.publicUrl
                : avatar
            }
            alt="Avatar"
            className={styles.avatarImg}
          />
          <label
            htmlFor="avatar-upload"
            className={styles.addPhotoBtn}
          >
            +
            <input
              ref={avatarInputRef}
              id="avatar-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={!isChanged()}
          className={styles.saveBtn}
        >
          Guardar cambios
        </button>
      </div>
    </SubpageLayout>
  );
}

export default EditProfile;
