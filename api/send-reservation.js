// NOTE: Resend's shared onboarding@resend.dev sender can only deliver to the
// Resend account's own signup email address (maybecoffeetruck@gmail.com)
// until a domain is verified at resend.com/domains (same limitation as
// api/send-review.js).
const TO_EMAIL = 'maybecoffeetruck@gmail.com';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fieldRow(label, value) {
  if (!value) return '';
  return `<p style="margin:0 0 6px;color:#c9a24b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">${label}</p>
    <p style="margin:0 0 18px;color:#f3ecdf;font-size:16px;">${value}</p>`;
}

function buildEmailHtml({ name, email, phone, date, time, guests, notes }) {
  const body = `
    ${fieldRow('Name', escapeHtml(name))}
    ${fieldRow('Email', escapeHtml(email))}
    ${fieldRow('Phone', escapeHtml(phone))}
    ${fieldRow('Preferred date', escapeHtml(date))}
    ${fieldRow('Preferred time', escapeHtml(time))}
    ${fieldRow('Guests', escapeHtml(guests))}
    ${fieldRow('Notes', escapeHtml(notes).replace(/\n/g, '<br />'))}
  `;

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
                <h1 style="margin:6px 0 0;color:#0a0908;font-size:22px;font-family:Arial,sans-serif;">New reservation request</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#0a0908;font-family:Arial,sans-serif;">
                <p style="margin:0;color:#8a8171;font-size:12px;">
                  Sent from the reservations form on the website. Reply directly to this person's email, or call them, to confirm.
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

  const { name, email, phone, date, time, guests, notes, acceptedTerms } = req.body || {};

  if (!name || !email || !phone) {
    res.status(400).json({ error: 'Name, email, and phone are required.' });
    return;
  }
  if (!EMAIL_RE.test(String(email).trim())) {
    res.status(400).json({ error: 'Please provide a valid email address.' });
    return;
  }
  if (!acceptedTerms) {
    res.status(400).json({ error: 'You must accept the terms and conditions.' });
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
        reply_to: email,
        subject: `New reservation request — ${name}`,
        html: buildEmailHtml({ name, email, phone, date, time, guests, notes }),
      }),
    });

    if (!emailResponse.ok) {
      const details = await emailResponse.text();
      console.error('Resend API error:', emailResponse.status, details);
      res.status(502).json({ error: 'Failed to send the reservation request.' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('send-reservation error:', error);
    res.status(500).json({ error: 'Unexpected server error.' });
  }
}
