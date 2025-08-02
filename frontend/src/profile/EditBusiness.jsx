// src/profile/EditBusiness.jsx
import styles from "../styles/profile/EditBusiness.module.css";
import SubpageLayout from '../layouts/SubpageLayout';
import editIcon from "../assets/edit.svg";
import avatar from "../assets/avatar.svg";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabase";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function EditBusiness() {
  const { profile, refreshProfile } = useUser();
  const [companyData, setCompanyData] = useState(null);
  const [editData, setEditData] = useState({ name: "", logo_path: null });
  const [pendingLogoFile, setPendingLogoFile] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const nameRef = useRef(null);
  const logoInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile?.company?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company.id)
        .single();

      if (error) {
        console.error("Error al obtener negocio:", error.message);
        toast.error("Error al cargar datos del negocio.");
      } else {
        setCompanyData(data);
        setEditData({
          name: data.name || "",
          logo_path: data.logo_path || null,
        });
      }
    })();
  }, [profile]);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error("Sólo se permiten imágenes JPG, PNG o WEBP.");
      return;
    }
    if (file.size > maxSize) {
      toast.warn("La imagen debe pesar menos de 2MB.");
      return;
    }

    setPendingLogoFile(file);
    setEditData({
      ...editData,
      logo_path: URL.createObjectURL(file), // vista previa temporal
    });
  };

  const handleSave = async () => {
    let logoPath = companyData?.logo_path;

    if (pendingLogoFile) {
      const filePath = `logos/${profile.company.owner_id}/${Date.now()}_${pendingLogoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("kueskilink")
        .upload(filePath, pendingLogoFile, { upsert: true });

      if (uploadError) {
        toast.error("Error al subir el logo");
        return;
      }
      logoPath = filePath;
    }

    const { error } = await supabase
      .from("companies")
      .update({
        name: editData.name,
        logo_path: logoPath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.company.id);

    if (error) {
      toast.error("Error al guardar cambios");
      return;
    }

    // Eliminar logo anterior si cambió
    const previousLogoPath = companyData?.logo_path;
    if (previousLogoPath && logoPath && previousLogoPath !== logoPath) {
      await supabase.storage.from("kueskilink").remove([previousLogoPath]);
    }

    await refreshProfile();

    // Redirigir con query param para toast en /profile
    navigate("/profile?updated=business", { replace: true });
  };

  const isChanged = () => {
    if (!companyData) return false;
    const nameChanged = editData.name !== companyData.name;
    const logoChanged =
      pendingLogoFile || editData.logo_path !== companyData.logo_path;
    return nameChanged || logoChanged;
  };

  return (
    <SubpageLayout title="Editar negocio" backLink="/profile">
      <div className={styles.container}>
        <h1>Edita tu negocio</h1>

        <div className={styles.field}>
          <span className={styles.label}>Nombre del Negocio</span>
          <div className={styles.valueRow}>
            {isEditingName ? (
              <input
                ref={nameRef}
                name="name"
                className={styles.input}
                value={editData.name}
                onChange={handleChange}
                placeholder="Nombre del negocio"
              />
            ) : (
              <span className={styles.value}>{editData.name}</span>
            )}
            <button
              className={styles.bName}
              onClick={() => {
                setIsEditingName(true);
                setTimeout(() => nameRef.current?.focus(), 100);
              }}
            >
              <img src={editIcon} alt="Editar" className={styles.editSvg} />
            </button>
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.field}>
          <span className={styles.label}>Logo</span>
        </div>
        <div className={styles.logoContainer}>
          <img
            src={
              pendingLogoFile
                ? editData.logo_path
                : editData.logo_path
                ? supabase.storage
                    .from("kueskilink")
                    .getPublicUrl(editData.logo_path).data.publicUrl
                : avatar
            }
            alt="Logo"
            className={styles.logoCircle}
          />
          <label className={styles.plusButton} htmlFor="logo-upload">
            +
            <input
              ref={logoInputRef}
              id="logo-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleLogoChange}
            />
          </label>
        </div>

        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={!isChanged()}
        >
          Guardar cambios
        </button>
      </div>
    </SubpageLayout>
  );
}

export default EditBusiness;
