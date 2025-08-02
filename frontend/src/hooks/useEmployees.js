// src/hooks/useEmployees.js
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';

export function useEmployees() {
  const { user, profile } = useUser();

  const inviteEmployee = async (email, name = null) => {
    if (!user || !profile) {
      return { error: 'No se pudo identificar la sesión.' };
    }

    const { data: existing, error: existingError } = await supabase
      .from('employee_invitations')
      .select('id, used')
      .eq('email', email)
      .eq('company_id', profile.company.id)
      .eq('used', false)
      .maybeSingle();

    if (existing && existing.used === false) {
      return { error: 'Este correo ya fue invitado y aún no ha sido registrado.' };
    }

    const { data, error } = await supabase
      .from('employee_invitations')
      .insert([
        {
          email,
          name,
          company_id: profile.company.id,
          invited_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error al invitar empleado:', error.message);
      return { error: 'Ocurrió un error al crear la invitación.' };
    }

    return { success: true, invitation: data };
  };

  return {
    inviteEmployee,
  };
}
