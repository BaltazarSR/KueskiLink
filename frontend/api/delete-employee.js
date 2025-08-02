// api/delete-employee.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ error: 'Falta el ID del empleado' });
  }

  try {
    // 1. Obtener datos del empleado
    const { data: employee, error: employeeError } = await supabase
      .from('users')
      .select('id, company_id')
      .eq('id', employeeId)
      .maybeSingle();

    if (employeeError || !employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // 2. Obtener owner de la empresa
    const { data: owner, error: ownerError } = await supabase
      .from('users')
      .select('id')
      .eq('company_id', employee.company_id)
      .eq('role', 'owner')
      .maybeSingle();

    if (ownerError || !owner) {
      return res.status(404).json({ error: 'Owner no encontrado' });
    }

    // 3. Reasignar transacciones del empleado al owner
    const { error: updateTxError } = await supabase
      .from('transactions')
      .update({ user_id: owner.id })
      .eq('user_id', employee.id);

    if (updateTxError) {
      return res.status(500).json({ error: 'Error reasignando transacciones' });
    }

    // 4. Eliminar al empleado de la tabla `users`
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', employee.id);

    if (deleteUserError) {
      return res.status(500).json({ error: 'Error eliminando de tabla users' });
    }

    // 5. Eliminar del schema `auth.users`
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(employee.id);

    if (authDeleteError) {
      return res.status(500).json({ error: 'Error eliminando de auth.users' });
    }

    return res.status(200).json({
      success: true,
      message: 'Empleado eliminado correctamente',
    });

  } catch (e) {
    console.error('Unexpected error:', e);
    return res.status(500).json({ error: 'Unexpected error' });
  }
}
