// src/profile/EditPassword.jsx
import styles from "../styles/profile/EditPassword.module.css";
import { useState } from "react";
import SubpageLayout from "../layouts/SubpageLayout";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function EditPassword() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error(error.message || "Error al cambiar la contraseña.");
    } else {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Redirigir con estado
      navigate("/profile?updated=password", { replace: true });
    }

    setLoading(false);
  };

  return (
    <SubpageLayout title="Cambiar contraseña">
      <div className={styles.container}>
        <h1>Cambia tu contraseña</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Contraseña actual</label>
            <input
              type="password"
              className={styles.input}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Contraseña nueva</label>
            <input
              type="password"
              className={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirmar contraseña nueva</label>
            <input
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </SubpageLayout>
  );
}

export default EditPassword;
