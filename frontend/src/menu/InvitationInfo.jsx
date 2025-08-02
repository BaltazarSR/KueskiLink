// src/menu/invitation-info/[id].jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import SubpageLayout from '../layouts/SubpageLayout';
import styles from '../styles/menu/EmployeeInfo.module.css';

export default function InvitationInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('employee_invitations')
        .select('id, name, email, created_at, used, token')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        console.error('Invitación no encontrada', error);
        // navegar a empleados pasando flag para mostrar toast allí
        navigate('/employees', {
          replace: true,
          state: { fromInvitationError: true }
        });
        return;
      }

      setInvite(data);
      setLoading(false);
    };

    fetchInvitation();
  }, [id, navigate]);

  const handleCancelInvitation = async () => {
    setConfirming(false);

    const { error } = await supabase
      .from('employee_invitations')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error al cancelar invitación');
    } else {
      // navegar a empleados pasando flag para toast de éxito
      navigate('/employees', {
        replace: true,
        state: { fromInvitationCancelled: true }
      });
    }
  };

  const handleResend = () => {
    const invitationLink = `${window.location.origin}/register?token=${invite.token}`;
    navigate('/send-invitation', { state: { invitationLink } });
  };

  if (loading) {
    return (
      <SubpageLayout title="Invitación" fallbackPath="/employees">
        <p>Cargando...</p>
      </SubpageLayout>
    );
  }
  if (!invite) return null;

  return (
    <SubpageLayout title="Invitación Pendiente" fallbackPath="/employees">
      <div className={styles.container}>
        <div>
          <label className={styles.label}>Nombre:</label>
          <input
            type="text"
            className={styles.input}
            value={invite.name || 'Sin nombre'}
            disabled
          />
        </div>
        <div>
          <label className={styles.label}>Correo:</label>
          <input
            type="text"
            className={styles.input}
            value={invite.email}
            disabled
          />
        </div>
        <div>
          <label className={styles.label}>Fecha de invitación:</label>
          <input
            type="text"
            className={styles.input}
            value={new Date(invite.created_at).toLocaleDateString()}
            disabled
          />
        </div>
        <div>
          <label className={styles.label}>Estado:</label>
          <input
            type="text"
            className={styles.input}
            value={invite.used ? 'Usada o cancelada' : 'Pendiente'}
            disabled
          />
        </div>

        <div className={styles['background-add-button']}>
          <button
            onClick={handleResend}
            className={styles.button}
            disabled={invite.used}
          >
            Reenviar invitación
          </button>

          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className={`${styles.button} ${styles.dangerButton}`}
            >
              Cancelar invitación
            </button>
          ) : (
            <div className={styles.confirmation}>
              <p>¿Seguro que deseas cancelar esta invitación?</p>
              <button
                onClick={handleCancelInvitation}
                className={`${styles.button} ${styles.dangerButton}`}
              >
                Sí, cancelar
              </button>
              <button
                onClick={() => setConfirming(false)}
                className={styles.button}
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </SubpageLayout>
  );
}
