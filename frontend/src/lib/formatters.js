// src/lib/formatters.js

/**
 * Formatea un valor numérico o string como dinero: $ 1,234.56
 */
export function formatMoney(input) {
  let value;

  if (typeof input === 'object' && input?.target?.value !== undefined) {
    value = input.target.value;
  } else if (typeof input === 'string' || typeof input === 'number') {
    value = input.toString();
  } else {
    return '';
  }

  value = value.replace(/[^0-9.]/g, '');
  if ((value.match(/\./g) || []).length > 1) {
    value = value.replace(/\.+$/, '');
  }

  const parts = value.split('.');
  if (parts.length > 1 && parts[1].length > 2) {
    parts[1] = parts[1].substring(0, 2);
  }

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const formatted = `$ ${parts.join('.')}`;
  if (typeof input === 'object') input.target.value = formatted;
  return formatted;
}

/**
 * Formatea cantidades numéricas: 1, 1.5, 10.25 → 1.5, 10.25, etc.
 */
export function formatQTY(input) {
  let value;

  if (typeof input === 'object' && input?.target?.value !== undefined) {
    value = input.target.value;
  } else if (typeof input === 'string' || typeof input === 'number') {
    value = input.toString();
  } else {
    return '';
  }

  value = value.replace(/[^0-9.]/g, '');
  if ((value.match(/\./g) || []).length > 1) {
    value = value.replace(/\.+$/, '');
  }

  const parts = value.split('.');
  if (parts.length > 1 && parts[1].length > 2) {
    parts[1] = parts[1].substring(0, 2);
  }

  const formatted = parts.join('.');
  if (typeof input === 'object') input.target.value = formatted;
  return formatted;
}
