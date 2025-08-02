// src/profile/DisableAccount.jsx

import { useState } from "react";
import SubpageLayout from "../layouts/SubpageLayout";
import styles from "../styles/profile/DisableAccount.module.css";

function DisableAccount() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            setError("Por favor completa ambos campos de contraseña.");
        } else if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
        } else {
            setError("");
            //AQUÍ IRÍA LA LÓGICA DE DESACTIVACIÓN O ELIMINACIÓN
        }
    };

    return (
        <SubpageLayout title="Desactivar o dar de baja tu cuenta">
            <h1>Dar de baja tu cuenta</h1>

            <hr></hr>

            <form className={styles.container} onSubmit={handleSubmit}>
                <div className={styles.option}>
                    <input type="radio" id="delete" name="accountAction" />
                    <label htmlFor="delete">
                        <strong>Dar de baja cuenta</strong>
                        <p className={styles.description}>
                            Esta opción eliminará tus datos de manera permanente y no se puede
                            deshacer.
                        </p>
                    </label>
                </div>

                <hr></hr>

                <h3 className={styles.subtitle}>Contraseña</h3>
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                />
                <h3 className={styles.subtitle}>Confirmar contraseña</h3>
                <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.input}
                />

                {error && <p className={styles.error}>{error}</p>}

                <button type="submit" className={styles.deactivateButton}>
                    Dar de baja tu cuenta
                </button>
            </form>
        </SubpageLayout>
    );
}

export default DisableAccount;
