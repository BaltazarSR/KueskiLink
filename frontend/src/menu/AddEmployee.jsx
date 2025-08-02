//src/menu/AddEmployee.jsx
import { useState } from 'react';
import styles from '../styles/menu/AddEmployee.module.css';
import { useEmployees } from '../hooks/useEmployees';
import SubpageLayout from '../layouts/SubpageLayout';
import { useNavigate } from 'react-router-dom';

function AddEmployee() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState(null);

  const { inviteEmployee } = useEmployees();
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setInviteLink(null);
    setLoading(true);

    if (!email.trim()) {
      setFeedback('Debes ingresar un correo válido.');
      setLoading(false);
      return;
    }

    const { success, error, invitation } = await inviteEmployee(email.trim(), name.trim() || null);

    if (success) {
      setFeedback('Invitación enviada con éxito.');
      const link = `${window.location.origin}/register?token=${invitation.token}`;
      navigate('/send-invitation', { state: { invitationLink: link } });
      setName('');
      setEmail('');
    } else {
      setFeedback(error || 'Ocurrió un error al invitar.');
    }

    setLoading(false);
  };

  return (
    <SubpageLayout>
      <div className={styles.container}>
        <h1>Agregar empleado</h1>

        <div>
          <label className={styles.label}>Nombre Completo:</label>
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className={styles.label}>Correo electrónico:</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {feedback && <p className={styles.feedback}>{feedback}</p>}

        <div className={styles['background-add-button']}>
          <button onClick={handleSubmit} disabled={loading} className={styles.button}>
            {loading ? 'Enviando...' : 'Guardar datos'}
          </button>
        </div>
      </div>

    </SubpageLayout>
  );
}

export default AddEmployee;
