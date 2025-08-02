//src/lib/utils.js
export function getEffectiveTransactionStatus(tx) {
  const now = new Date();
  const expires = tx.expiration_date ? new Date(tx.expiration_date) : null;

  if (['approved', 'pagado_efectivo', 'canceled', 'denied'].includes(tx.status)) {
    return tx.status;
  }

  // Si ya venció por tiempo general
  if (expires && now > expires) {
    return 'expired';
  }

  // Si fue enviado a Kueski pero ya pasaron los 90 minutos
  if (tx.kueski_created_at) {
    const kueskiExpires = new Date(tx.kueski_created_at).getTime() + 150 * 60000;
    if (now.getTime() > kueskiExpires) {
      return 'kueski_expired';
    }
  }

  // Si aún está activa o en espera
  return tx.status;
}
