const TO_EMAIL = 'maybecoffetruck@gmail.com';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEmailHtml({ name, email, phone, description }) {
  const safeName = escapeHtml(name) || 'Not provided';
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeDescription = escapeHtml(description).replace(/\n/g, '<br />');

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#FAF6F1;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F1;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E8DCC9;">
            <tr>
              <td style="background:#6F4A34;padding:28px 32px;">
                <p style="margin:0;color:#E4D3BC;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Maybe Café</p>
                <h1 style="margin:6px 0 0;color:#FFFFFF;font-size:22px;font-family:Arial,sans-serif;">New Private Event Request</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #E8DCC9;color:#8A7563;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Name</td>
                  </tr>
                  <tr>
                    <td style="padding:2px 0 14px;color:#3D2E24;font-size:16px;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #E8DCC9;color:#8A7563;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</td>
                  </tr>
                  <tr>
                    <td style="padding:2px 0 14px;color:#3D2E24;font-size:16px;">
                      <a href="mailto:${safeEmail}" style="color:#6F4A34;text-decoration:none;">${safeEmail}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #E8DCC9;color:#8A7563;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Phone</td>
                  </tr>
                  <tr>
                    <td style="padding:2px 0 14px;color:#3D2E24;font-size:16px;">
                      <a href="tel:${safePhone}" style="color:#6F4A34;text-decoration:none;">${safePhone}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #E8DCC9;color:#8A7563;font-size:12px;text-transform:uppercase;letter-spacing:1px;">What they need</td>
                  </tr>
                  <tr>
                    <td style="padding:2px 0 4px;color:#3D2E24;font-size:15px;line-height:1.6;">${safeDescription}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#F1E7D9;font-family:Arial,sans-serif;">
                <p style="margin:0;color:#8A7563;font-size:12px;">Sent from the Private Events form on the Maybe Café website.</p>
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

  const { name, email, phone, description } = req.body || {};

  if (!email || !phone || !description) {
    res.status(400).json({ error: 'Email, phone, and description are required.' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Email service is not configured yet.' });
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
        subject: `New Event Request — ${name || email}`,
        html: buildEmailHtml({ name, email, phone, description }),
      }),
    });

    if (!emailResponse.ok) {
      const details = await emailResponse.text();
      res.status(502).json({ error: 'Failed to send email', details });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Unexpected server error.' });
  }
}
