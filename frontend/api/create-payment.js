//api/create-payment.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { transactionId, name, email, phone, customerRequest } = req.body;


  if (!transactionId) {
    return res.status(400).json({ error: 'Falta transactionId' });
  }

  try {
    // 1. Obtener transacción
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (txError || !tx) {
      console.error('Error en transacción:', txError?.message);
      return res.status(500).json({ error: 'Error al obtener la transacción' });
    }

    // 2. Obtener productos
    const { data: pt, error: ptError } = await supabase
      .from('products_transactions')
      .select('unit_price, quantity, description, products (name)')
      .eq('transaction_id', transactionId);

    if (ptError || !pt) {
      console.error('Error en productos:', ptError?.message);
      return res.status(500).json({ error: 'Error al obtener los productos' });
    }

    // 3. Preparar nombre de envío
    const trimmedName = (name || '').trim();
    const [first, ...rest] = trimmedName.split(' ');
    const shippingName = {
      name: first || 'Cliente',
      last: rest.length > 0 ? rest.join(' ') : 'Anonimo'
    };

    // 4. Construir payload para Kueski
    const payload = {
      order_id: transactionId,
      description: tx.concept || 'Sin descripción',
      amount: {
        total: tx.amount,
        currency: 'MXN',
        details: { subtotal: tx.amount }
      },
      items: pt.map((item, i) => ({
        name: item.products.name,
        description: item.description || '',
        quantity: item.quantity,
        price: item.unit_price,
        currency: 'MXN',
        sku: `SKU-${i + 1}`
      })),
      shipping: {
        name: shippingName,
        address: {
          address: "Sin dirección",
          interior: "",
          neighborhood: "",
          city: "CDMX",
          state: "CDMX",
          zipcode: "06000",
          country: "MX"
        },
        phone_number: phone || '0000000000',
        email: email || 'no-email@placeholder.com'
      },
      callbacks: {
        on_success: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kueski-link.vercel.app'}/success`,
        on_reject: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kueski-link.vercel.app'}/reject`,
        on_canceled: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kueski-link.vercel.app'}/canceled`,
        on_failed: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kueski-link.vercel.app'}/failed`
      }
    };

    // 5. Enviar a Kueski
    const kueskiRes = await fetch('https://payments-api.sandbox-pay.kueski.codes/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.API_KEY}`,
        'kp-name': 'kueskilink-dev',
        'kp-source': 'web',
        'kp-version': '1.0.0',
        'kp-trigger': 'api'
      },
      body: JSON.stringify(payload)
    });

    const result = await kueskiRes.json();

    if (result.status === 'success') {
    // 6. Guardar URL y timestamp en BD
    await supabase
      .from('transactions')
      .update({
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        customer_request: customerRequest || null,
        updated_at: new Date().toISOString(),
        kueski_payment_url: result.data.callback_url,
        kueski_created_at: new Date().toISOString()
      })
      .eq('id', transactionId);


    return res.status(200).json({ status: 'success', data: result.data });

    } else {
      console.error('Error Kueski:', result);
      return res.status(500).json({ error: 'Error en respuesta de Kueski', details: result });
    }

  } catch (err) {
    console.error('Error general:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
