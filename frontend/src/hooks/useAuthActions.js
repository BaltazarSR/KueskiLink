// src/hooks/useAuthActions.js
import { supabase } from '../lib/supabase';

export function useAuthActions() {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://kueski-link.vercel.app/complete-profile';

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email, password, token = null) => {
    const redirectUrl = `${siteUrl}${token ? `?token=${token}` : ''}`;

    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      }
    });
  };

  const completeProfile = async ({ businessName, name, phone, logoFile, token = null }) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session?.user) {
        throw new Error('No hay sesión activa.');
      }

      const user = session.user;
      let logoPath = null;
      let companyId = null;

      // 🧩 Subir logo si aplica (solo dueños)
      if (logoFile && !token) {
        const sanitizedFileName = logoFile.name.replace(/[^\w.-]/g, '_');
        const filePath = `logos/${user.id}/${Date.now()}_${sanitizedFileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('kueskilink')
          .upload(filePath, logoFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          console.error('[completeProfile][uploadLogo]', uploadError);
          throw new Error(uploadError.message || 'Error desconocido al subir logo.');
        }

        logoPath = uploadData.path;
      }

      // ✅ Caso 1: Empleado (registro con token)
      if (token) {
        const { data: invitation, error: invitationError } = await supabase
          .from('employee_invitations')
          .select('*')
          .eq('token', token)
          .eq('used', false)
          .single();

        if (invitationError || !invitation) {
          console.error('[completeProfile][fetchInvitation]', invitationError);
          throw new Error('Invitación inválida o ya utilizada.');
        }

        companyId = invitation.company_id;

        const { error: userInsertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            company_id: companyId,
            role: 'employee',
            name,
            phone,
            email: user.email
          });

        if (userInsertError) {
          console.error('[completeProfile][insertEmployee]', userInsertError);
          throw new Error('No se pudo crear el usuario empleado.');
        }

        const { error: updateError } = await supabase
          .from('employee_invitations')
          .update({ used: true })
          .eq('token', token);

        if (updateError) {
          console.error('[completeProfile][markInvitationUsed]', updateError);
          throw new Error('No se pudo marcar la invitación como usada.');
        }

      } else {
        // ✅ Caso 2: Dueño (registro normal)
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: businessName,
            phone: phone || null,
            email: user.email,
            logo_path: logoPath || null,
            owner_id: user.id,
          })
          .select('id')
          .single();

        if (companyError) {
          console.error('[completeProfile][insertCompany]', companyError);
          throw new Error('No se pudo crear la empresa.');
        }

        companyId = companyData.id;

        const { error: userInsertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            company_id: companyId,
            role: 'owner',
            name,
            phone,
            avatar_path: null, // ⛔ no usamos logo como avatar
            email: user.email
          });

        if (userInsertError) {
          console.error('[completeProfile][insertOwner]', userInsertError);
          throw new Error('No se pudo crear el perfil del dueño.');
        }
      }

      return { success: true };

    } catch (error) {
      console.error('[completeProfile][main]', error);
      return { error: error.message || 'Error desconocido' };
    }
  };

  const resendVerification = async (email) => {
    return await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: siteUrl,
      }
    });
  };

  const refreshSession = async () => {
    return await supabase.auth.refreshSession();
  };

  const getUser = async () => {
    return await supabase.auth.getUser();
  };

  return {
    signIn,
    signUp,
    completeProfile,
    resendVerification,
    refreshSession,
    getUser,
  };
}
