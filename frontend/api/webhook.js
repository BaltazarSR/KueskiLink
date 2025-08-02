// api/webhook.js
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const API_KEY    = process.env.API_KEY
const API_SECRET = process.env.API_SECRET

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const rawBody = Buffer.concat(chunks).toString('utf8')

  const incomingHeader =
    req.headers['kueski-authorization'] ||
    req.headers.authorization ||
    ''
  const [, incomingToken] = incomingHeader.split(' ')

  let outStatus = 'ok'
  let error = ''

  try {
    if (!incomingToken) throw new Error('No token provided')
    jwt.verify(incomingToken, API_SECRET)

    const { payment_id, order_id, status: newStatus, status_reason } =
      JSON.parse(rawBody)

    const { error: dbError } = await supabase
      .from('transactions')
      .update({ payment_id, status: newStatus, status_reason })
      .eq('id', order_id)

    if (dbError) {
      throw new Error(dbError.message)
    }

    if (newStatus === 'approved') {
      outStatus = 'accept'
    } else if (newStatus === 'canceled' || newStatus === 'denied') {
      outStatus = 'ok'
    }

  } catch (err) {
    console.error('Error de verificación o DB:', err.message)
    outStatus = 'reject'
    error = err.message
  }

  // Crear JWT de respuesta
  const nowSec = Math.floor(Date.now() / 1000)
  const iat = nowSec
  const exp = nowSec + 5 * 60

  const jti = crypto
    .createHash('sha256')
    .update(`${API_SECRET}:${iat}`)
    .digest('hex')

  const responseJwtPayload = {
    public_key: API_KEY,
    iat,
    exp,
    jti
  }

  const responseToken = jwt.sign(
    responseJwtPayload,
    API_SECRET,
    { algorithm: 'HS256' }
  )

  res.setHeader('Authorization',        `Bearer ${responseToken}`)
  res.setHeader('kueski-authorization', `Bearer ${responseToken}`)
  res.setHeader('Content-Type',         'application/json')

  return res.status(200).json({ status: outStatus, error: error || undefined })
}
