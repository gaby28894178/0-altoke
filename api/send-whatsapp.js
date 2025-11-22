export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' })
    return
  }
  try {
    const token = process.env.WHATSAPP_TOKEN
    const phoneId = process.env.WHATSAPP_PHONE_ID
    const { to, text } = req.body || {}
    if (!token || !phoneId) {
      res.status(501).json({ ok: false, error: 'not_configured' })
      return
    }
    if (!to || !text) {
      res.status(400).json({ ok: false, error: 'invalid_payload' })
      return
    }
    const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`
    const body = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { preview_url: false, body: text }
    }
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    const data = await r.json()
    if (!r.ok) {
      res.status(r.status).json({ ok: false, error: 'send_failed', details: data })
      return
    }
    res.status(200).json({ ok: true, data })
  } catch (e) {
    res.status(500).json({ ok: false, error: 'server_error' })
  }
}