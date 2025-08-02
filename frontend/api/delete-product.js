// /api/delete-product.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Falta el ID del producto' });
  }

  try {
    // Verificar si tiene transacciones relacionadas
    const { data: transactions, error: txError } = await supabase
      .from('products_transactions')
      .select('id')
      .eq('product_id', productId)
      .limit(1); // basta con saber si hay al menos una

    if (txError) {
      console.error('Error al verificar transacciones:', txError);
      return res.status(500).json({ error: 'Error al verificar transacciones' });
    }

    const hasTransactions = transactions.length > 0;

    if (hasTransactions) {
      // Si tiene transacciones, actualizar status a 'deleted'
      const { error: updateError } = await supabase
        .from('products')
        .update({ status: 'deleted' })
        .eq('id', productId);

      if (updateError) {
        console.error('Error al marcar como eliminado:', updateError);
        return res.status(500).json({ error: 'Error al actualizar producto' });
      }

      return res.status(200).json({ message: 'Producto marcado como eliminado' });
    } else {
      // Si no tiene transacciones, eliminarlo permanentemente
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (deleteError) {
        console.error('Error al eliminar producto:', deleteError);
        return res.status(500).json({ error: 'Error al eliminar producto' });
      }

      return res.status(200).json({ message: 'Producto eliminado permanentemente' });
    }
  } catch (err) {
    console.error('Error interno:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
