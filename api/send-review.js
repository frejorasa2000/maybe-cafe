// NOTE: Resend's shared onboarding@resend.dev sender can only deliver to the
// Resend account's own signup email address (maybecoffeetruck@gmail.com)
// until a domain is verified at resend.com/domains.
const TO_EMAIL = 'maybecoffeetruck@gmail.com';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEmailHtml({ name, rating, text }) {
  const safeName = escapeHtml(name) || 'Anonymous';
  const safeText = escapeHtml(text).replace(/\n/g, '<br />');
  const stars = '★★★★★☆☆☆☆☆'.slice(5 - Number(rating || 5), 10 - Number(rating || 5));

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0908;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0908;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px;background:#141110;border-radius:16px;overflow:hidden;border:1px solid #2a251f;">
            <tr>
              <td style="background:linear-gradient(135deg,#e4c988,#c9a24b);padding:28px 32px;">
                <p style="margin:0;color:#0a0908;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Maybe Café</p>
                <h1 style="margin:6px 0 0;color:#0a0908;font-size:22px;font-family:Arial,sans-serif;">New review from the website</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <p style="margin:0 0 6px;color:#c9a24b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">From</p>
                <p style="margin:0 0 18px;color:#f3ecdf;font-size:16px;">${safeName}</p>
                <p style="margin:0 0 6px;color:#c9a24b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Rating</p>
                <p style="margin:0 0 18px;color:#e4c988;font-size:20px;">${stars}</p>
                <p style="margin:0 0 6px;color:#c9a24b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Review</p>
                <p style="margin:0;color:#f3ecdf;font-size:15px;line-height:1.6;">${safeText}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#0a0908;font-family:Arial,sans-serif;">
                <p style="margin:0;color:#8a8171;font-size:12px;">
                  Sent from the reviews form on the website. This does NOT post to Google — if you'd like
                  it to be public, ask ${safeName} to also leave it at the Google review link.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, rating, text } = req.body || {};

  if (!name || !text) {
    res.status(400).json({ error: 'Name and review text are required.' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'The email service is not configured yet.' });
    return;
  }

  try {
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Maybe Café Website <onboarding@resend.dev>',
        to: [TO_EMAIL],
        subject: `New review — ${name} (${rating}/5)`,
        html: buildEmailHtml({ name, rating, text }),
      }),
    });

    if (!emailResponse.ok) {
      const details = await emailResponse.text();
      console.error('Resend API error:', emailResponse.status, details);
      res.status(502).json({ error: 'Failed to send the email.', details });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('send-review error:', error);
    res.status(500).json({ error: 'Unexpected server error.' });
  }
}
