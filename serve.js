const express = require('express');
const path    = require('path');
const { Resend } = require('resend');

const app  = express();
const PORT = 5000;
const ROOT = path.join(__dirname, 'librenta-github-repo');

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());
app.use(express.static(ROOT));

app.post('/registro', async (req, res) => {
  const { nombre, email, telefono, ciudad, rol } = req.body || {};

  if (!nombre || !email || !ciudad || !rol) {
    return res.status(400).json({ ok: false, error: 'Campos obligatorios incompletos' });
  }

  const esArrendatario = rol === 'Arrendatario';

  const asuntoUsuario = esArrendatario
    ? '¡Gracias por unirte a LIBRENTA! 🏄'
    : '¡Tu material puede generar dinero! 💰';

  const htmlUsuario = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f4faf4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4faf4;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#006e17;padding:36px 40px;text-align:center;">
            <span style="color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">LIB<span style="color:#a3e97a;">RENTA</span></span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 24px;">
            <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#1a1c1b;">
              ${esArrendatario ? '¡Bienvenido/a a la comunidad, ' + nombre.split(' ')[0] + '! 🎉' : 'Hola ' + nombre.split(' ')[0] + ', gracias por querer prestar 🔑'}
            </h1>
            <p style="margin:0 0 20px;font-size:16px;color:#444;line-height:1.6;">
              ${esArrendatario
                ? 'Ya estás en nuestra lista de espera. Cuando lancemos en <strong>' + ciudad + '</strong> serás el primero en saberlo y en poder alquilar material deportivo de particulares a precios increíbles.'
                : 'Ya estás en nuestra lista de prestadores. Cuando lancemos en <strong>' + ciudad + '</strong> te avisaremos para que puedas poner tu material a generar ingresos, sin complicaciones.'}
            </p>

            <!-- Highlight box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4faf4;border-radius:16px;margin-bottom:28px;">
              <tr><td style="padding:24px 28px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#006e17;text-transform:uppercase;letter-spacing:1px;">¿Qué pasa ahora?</p>
                ${esArrendatario ? `
                <p style="margin:4px 0;font-size:15px;color:#333;">📬 Te avisamos en cuanto lancemos en tu zona</p>
                <p style="margin:4px 0;font-size:15px;color:#333;">🏄 Acceso anticipado a los mejores prestadores</p>
                <p style="margin:4px 0;font-size:15px;color:#333;">💸 Precios de lanzamiento exclusivos para ti</p>
                ` : `
                <p style="margin:4px 0;font-size:15px;color:#333;">📬 Te contactamos cuando lancemos en tu zona</p>
                <p style="margin:4px 0;font-size:15px;color:#333;">💰 Empieza a rentabilizar tu material deportivo</p>
                <p style="margin:4px 0;font-size:15px;color:#333;">🛡️ Cobertura de seguro en cada alquiler</p>
                `}
              </td></tr>
            </table>

            <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">
              Si tienes cualquier pregunta, responde a este email y te contestamos encantados.
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr><td style="background:#E8732A;border-radius:12px;">
                <a href="https://form.jotform.com/260901816528055" style="display:inline-block;padding:14px 32px;color:#fff;font-size:16px;font-weight:800;text-decoration:none;">
                  Rellenar encuesta →
                </a>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f4faf4;padding:24px 40px;border-top:1px solid #e8e8e6;">
            <p style="margin:0;font-size:13px;color:#888;line-height:1.5;">
              Con cariño,<br/>
              <strong style="color:#006e17;">Guille, Feli y Sebas — Equipo LIBRENTA</strong>
            </p>
            <p style="margin:10px 0 0;font-size:11px;color:#bbb;">
              Recibiste este email porque te apuntaste en librenta.com. Sin spam, lo prometemos.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const htmlEquipo = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/></head>
<body style="font-family:monospace;background:#f9f9f9;padding:32px;">
  <div style="background:#fff;border-radius:12px;padding:28px;max-width:520px;border:1px solid #e8e8e6;">
    <h2 style="margin:0 0 16px;color:#006e17;">🆕 Nuevo registro en LIBRENTA</h2>
    <table style="border-collapse:collapse;width:100%;">
      <tr><td style="padding:8px 12px;background:#f4faf4;font-weight:700;border-radius:6px 0 0 6px;width:120px;">Nombre</td><td style="padding:8px 12px;">${nombre}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:700;">Email</td><td style="padding:8px 12px;"><a href="mailto:${email}" style="color:#006e17;">${email}</a></td></tr>
      <tr><td style="padding:8px 12px;background:#f4faf4;font-weight:700;">Teléfono</td><td style="padding:8px 12px;">${telefono ? '+34 ' + telefono : '—'}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:700;">Ciudad</td><td style="padding:8px 12px;">${ciudad}</td></tr>
      <tr><td style="padding:8px 12px;background:#f4faf4;font-weight:700;">Rol</td><td style="padding:8px 12px;"><span style="background:${esArrendatario ? '#e6f3e6' : '#fff3e6'};color:${esArrendatario ? '#006e17' : '#E8732A'};padding:2px 10px;border-radius:20px;font-weight:700;">${rol}</span></td></tr>
    </table>
  </div>
</body>
</html>`;

  const senderFrom    = process.env.RESEND_FROM || 'onboarding@resend.dev';
  const fromUsuario   = `LIBRENTA <${senderFrom}>`;
  const fromEquipo    = `LIBRENTA Registros <${senderFrom}>`;

  const results = await Promise.allSettled([
    resend.emails.send({
      from:    fromUsuario,
      to:      [email],
      subject: asuntoUsuario,
      html:    htmlUsuario,
    }),
    resend.emails.send({
      from:    fromEquipo,
      to:      [process.env.EMAIL_EQUIPO],
      subject: `[LIBRENTA] Nuevo ${rol}: ${nombre} (${ciudad})`,
      html:    htmlEquipo,
    }),
  ]);

  results.forEach((r, i) => {
    const label = i === 0 ? `bienvenida→${email}` : `notif→${process.env.EMAIL_EQUIPO}`;
    if (r.status === 'rejected') {
      console.error(`[Resend] ERROR ${label}:`, r.reason?.message || r.reason);
    } else if (r.value?.error) {
      console.error(`[Resend] ERROR ${label}:`, r.value.error.message);
    } else {
      console.log(`[Resend] OK ${label} id=${r.value?.data?.id}`);
    }
  });

  return res.json({ ok: true });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Librenta server running at http://0.0.0.0:${PORT}`);
});
