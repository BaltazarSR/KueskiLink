// api/get-transaction.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Falta el id' });

  try {
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .select('id, concept, amount, note_to_client, customer_request, status, expiration_date, company_id')
      .eq('id', id)
      .maybeSingle();

    if (txError || !tx) return res.status(404).json({ error: 'No encontrada' });

    if (tx.status !== 'pendiente' || new Date(tx.expiration_date) < new Date()) {
      return res.status(403).json({ error: 'Transacción expirada o no disponible' });
    }

    const { data: items, error: itemsError } = await supabase
      .from('products_transactions')
      .select(`
        unit_price,
        quantity,
        description,
        products ( name, image_path, type )
      `)
      .eq('transaction_id', id);
    if (itemsError) throw itemsError;

    // <-- Aquí corregimos el from()
    const { data: company, error: compError } = await supabase
      .from('companies')
      .select('name, logo_path')
      .eq('id', tx.company_id)
      .maybeSingle();
    if (compError) throw compError;

    return res.status(200).json({
      transaction: {
        id: tx.id,
        concept: tx.concept,
        amount: tx.amount,
        note_to_client: tx.note_to_client,
        customer_request: tx.customer_request,
        status: tx.status,
        expiration_date: tx.expiration_date
      },
      products: items,
      company: {
        name: company?.name || null,
        logo_path: company?.logo_path || null
      }
    });
  } catch (err) {
    console.error('Error en get-transaction:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
