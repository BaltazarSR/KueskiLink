// /api/pay-cash.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { transactionId, name, email, phone, customerRequest } = req.body;


  if (!transactionId || !name || !email || !phone) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' })
  }

  try {
    // 1. Validar transacción
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .maybeSingle()

    if (txError || !tx) {
      return res.status(404).json({ error: 'Transacción no encontrada' })
    }

    if (tx.status !== 'pendiente') {
      return res.status(403).json({ error: 'Transacción ya procesada o inválida' })
    }

    const now = new Date()
    if (tx.expiration_date && new Date(tx.expiration_date) < now) {
      return res.status(403).json({ error: 'Transacción expirada' })
    }

    // 2. Actualizar a "pendiente_efectivo" y guardar datos del cliente
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'pendiente_efectivo',
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        customer_request: customerRequest || null,
        updated_at: now.toISOString()
      })
      .eq('id', transactionId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return res.status(200).json({ status: 'ok', message: 'Pago en efectivo registrado' })

  } catch (err) {
    console.error('Error en pay-cash:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
