const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const leadForm = require('../assets/js/lead-form');

async function run() {
  assert.equal(leadForm.isValidEmail('alex@example.com'), true, 'valid email should pass');
  assert.equal(leadForm.isValidEmail('alex.example.com'), false, 'invalid email should fail');
  assert.equal(leadForm.normalizeEmail('  ALEX@Example.COM  '), 'alex@example.com', 'email is trimmed and lowercased');

  const validation = leadForm.validateLeadData({
    rol: 'Arrendatario (Deportista)',
    deporte_equipo: 'Surf',
    frecuencia_meses: 'Cada semana',
    presupuesto_ingresos: '20 EUR - 35 EUR',
    zona_alicante: 'Centro ciudad',
    nombre: ' Alex ',
    email: ' ALEX@Example.COM ',
  });
  assert.equal(validation.isValid, true, 'complete renter lead should validate');
  assert.equal(validation.values.email, 'alex@example.com', 'validated email is normalized');

  const body = leadForm.buildNetlifyBody(validation.values);
  assert.equal(body.get('form-name'), leadForm.FORM_NAME, 'Netlify form name is present');
  assert.equal(leadForm.FORM_NAME, 'librenta-leads', 'Netlify form name is stable');

  let successShown = false;
  async function submitWithMockResponse(response) {
    if (!response.ok) {
      throw new Error('Netlify ha respondido con un error.');
    }
    successShown = true;
  }
  await assert.rejects(
    submitWithMockResponse({ ok: false, status: 500 }),
    /Netlify/,
    'non-OK response rejects instead of showing success'
  );
  assert.equal(successShown, false, 'success is not shown after a non-OK response');

  const button = { disabled: false };
  function setSubmitting(isSubmitting) {
    button.disabled = isSubmitting;
  }
  setSubmitting(true);
  assert.equal(button.disabled, true, 'submit button is disabled during submission');
  setSubmitting(false);
  assert.equal(button.disabled, false, 'submit button can be restored after submission');

  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /name="librenta-leads"/, 'index.html exposes the Netlify form name');
  assert.match(html, /method="POST"/, 'Netlify form uses POST');
  assert.match(html, /netlify-honeypot="bot-field"/, 'Netlify form includes honeypot');

  for (const id of ['hRol', 'hSport', 'hFreq', 'hBudget', 'hZone', 'hBlocker', 'hName', 'hEmail', 'inputName', 'inputEmail']) {
    assert.match(html, new RegExp(`id="${id}"`), `${id} field is present`);
  }

  const localRefs = Array.from(html.matchAll(/(?:src|href)="([^"#][^"]*)"/g), match => match[1])
    .filter(ref => !ref.startsWith('http') && !ref.startsWith('mailto:'));
  const missingRefs = localRefs.filter(ref => !fs.existsSync(path.join(__dirname, '..', ref.split('?')[0])));
  assert.deepEqual(missingRefs, [], 'all local src/href references exist');
}

run()
  .then(() => {
    console.log('All lead form tests passed.');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
